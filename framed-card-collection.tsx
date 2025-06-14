"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { X, User } from "lucide-react";
import io, { Socket } from "socket.io-client";
import _ from "lodash";

interface Player {
  name: string;
  points: number;
  storyTeller: boolean;
}

interface Card {
  id: string;
  image: string;
  playerRef: string;
}

const PlayerCard = ({
  player,
  isMe,
  flippedPlayer,
  loaded,
  handlePlayerClick,
  setFlippedPlayer,
}: {
  player: Player;
  isMe: boolean;
  flippedPlayer: string | null;
  loaded: boolean;
  handlePlayerClick: (playerName: string) => void;
  setFlippedPlayer: (playerName: string | null) => void;
}) => {
  const isFlipped = flippedPlayer === player.name;
  const ponts = useRef(player.points);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [scoreAnimationPoints, setScoreAnimationPoints] = useState(0);

  useEffect(() => {
    if (ponts.current !== player.points) {
      const pointsDifference = player.points - ponts.current;
      setScoreAnimationPoints(pointsDifference);
      ponts.current = player.points;
      setScoreAnimation(true);

      setTimeout(() => {
        setScoreAnimation(false);
      }, 3000);
    }
  }, [player.points]);

  return (
    <div
      className={cn(
        "flex flex-col items-center space-y-2 transition-all duration-300 cursor-pointer relative",
        loaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
      )}
      onClick={() => handlePlayerClick(player.name)}
      onMouseEnter={() => setFlippedPlayer(player.name)}
      onMouseLeave={() => setFlippedPlayer(null)}
    >
      {scoreAnimation && scoreAnimationPoints !== 0 && (
        <div
          className={cn(
            "absolute -top-8 left-1/2 transform -translate-x-1/2 z-20",
            "bg-amber-400 text-amber-900 px-2 py-1 rounded-full text-xs font-bold",
            "animate-bounce shadow-lg border border-amber-600",
            scoreAnimationPoints > 0
              ? "text-green-800 bg-green-400"
              : "text-red-800 bg-red-400"
          )}
        >
          {scoreAnimationPoints > 0 ? "+" : ""}
          {scoreAnimationPoints}
        </div>
      )}

      <div
        className={cn(
          "relative w-16 h-16 rounded-full overflow-hidden border-4 transition-all duration-300",
          "border-amber-600/70"
        )}
        style={{ perspective: "1000px" }}
      >
        <div
          className={cn(
            "relative w-full h-full transition-transform duration-700 transform-style-preserve-3d",
            isFlipped ? "rotate-y-180" : ""
          )}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front side - Avatar */}
          <div
            className="absolute inset-0 w-full h-full backface-hidden rounded-full overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div
              className={cn("absolute inset-0 rounded-full", "bg-gray-800/50")}
            ></div>
            <Image
              src={"/avatar.jpg"}
              alt={`${player.name}'s avatar`}
              fill
              className="object-cover"
              sizes="64px"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <User size={20} className="text-gray-400" />
            </div>
          </div>

          {/* Back side - Score */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full backface-hidden rounded-full flex flex-col items-center justify-center text-center p-1",
              player.storyTeller
                ? "bg-gradient-to-br from-amber-800 to-amber-950"
                : "bg-gradient-to-br from-gray-700 to-gray-900"
            )}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-xs font-bold text-white">
                {player.points?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-slate-900 animate-pulse z-10"></div>
      </div>
      <div className="text-center">
        <p
          className={cn(
            "text-sm font-medium transition-colors duration-300",
            isMe ? "text-amber-300" : "text-amber-100"
          )}
        >
          {isMe ? "You" : player.name}{" "}
        </p>
        {player.storyTeller && (
          <p className="text-xs text-amber-400/80">{"(Storyteller)"}</p>
        )}
      </div>
    </div>
  );
};

export default function Game() {
  const [loaded, setLoaded] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [animationOrigin] = useState({ x: 0, y: 0 });
  const [flippedPlayer, setFlippedPlayer] = useState<string | null>(null);
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [me, setMe] = useState<Player | null>(null);
  const [cardsOnTable, setCardsOnTable] = useState<Card[]>([]);
  const [myCards, setMyCards] = useState<Card[]>([]);
  const [roomInfo, setRoomInfo] = useState<{
    message: string;
    required: number;
    current: number;
  } | null>(null);
  const [storyInput, setStoryInput] = useState("");
  const [stage, setStage] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<string | null>(null);
  useEffect(() => {
    const sock = io("https://dev.writecraft.io", {
      transports: ["polling", "websocket"],
    });
    setSocket(sock);

    // Extract URL parameters and join room
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get("name");
    const roomIdParam = params.get("roomId");

    if (nameParam && roomIdParam) {
      sock.emit("joinRoom", {
        roomId: roomIdParam,
        id: nameParam,
        numberOfPlayers: params.get("numberOfPlayers"),
      });
    }

    sock.on(
      "returnState",
      (
        state:
          | { message: string; required: number; current: number }
          | {
              cardsOnBoard: Card[];
              stage: string;
              activeStory: string;
              myCards: Card[];
              players: Player[];
              me: Player;
            }
      ) => {
        if ("message" in state) {
          setRoomInfo((prev) => (_.isEqual(prev, state) ? prev : state));
        } else {
          setRoomInfo(null);
        }
        if ("stage" in state) {
          setStage((prev) =>
            _.isEqual(prev, state.stage) ? prev : state.stage
          );
        }
        if ("cardsOnBoard" in state) {
          setCardsOnTable((prev) =>
            _.isEqual(prev, state.cardsOnBoard) ? prev : state.cardsOnBoard
          );
        }
        if ("activeStory" in state) {
          setActiveStory((prev) =>
            _.isEqual(prev, state.activeStory) ? prev : state.activeStory
          );
        }
        if ("myCards" in state) {
          setMyCards((prev) => {
            console.log(_.isEqual(prev, state.myCards));
            return _.isEqual(prev, state.myCards) ? prev : state.myCards;
          });
        }
        if ("players" in state) {
          setPlayers((prev) =>
            _.isEqual(prev, state.players) ? prev : state.players
          );
        }
        if ("me" in state) {
          setMe((prev) => (_.isEqual(prev, state.me) ? prev : state.me));
        }
      }
    ); // Return State
  }, []);

  const amIStoryTeller = me?.storyTeller || false;

  const onSendStory = (cardId: string, story?: string) => {
    if (!amIStoryTeller) return alert("You are not the storyteller");
    socket?.emit("move", {
      type: "story",
      story: story,
      cardId: cardId,
    });
  };

  const onSendVote = (cardId: string) => {
    socket?.emit("move", {
      type: "vote",
      cardId: cardId,
    });
  };

  const onSendPickCard = (cardId: string) => {
    socket?.emit("move", {
      type: "pickCard",
      cardId: cardId,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const closeModal = () => {
    setSelectedCard(null);
    setStoryInput("");
  };

  const handlePlayerClick = (playerName: string) => {
    setFlippedPlayer(flippedPlayer === playerName ? null : playerName);
  };

  const handleStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !storyInput.trim()) return;

    onSendStory(selectedCard.id, storyInput.trim());
    closeModal();
  };
  const FrameComponent = ({
    item,
    cardIndex,
    onClick,
  }: {
    item: Card;
    cardIndex: number;
    onClick?: () => void;
  }) => (
    <div
      ref={(el) => {
        cardRefs.current[cardIndex] = el;
      }}
      className={cn(
        "relative transition-all duration-300 transform",
        onClick
          ? "cursor-pointer hover:scale-105 hover:-translate-y-2"
          : "cursor-not-allowed opacity-50",
        loaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
      )}
      onClick={onClick}
    >
      {/* Outer decorative frame */}
      <div className="absolute inset-0 -m-2 border-4 border-amber-700/80 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-gradient-to-br from-amber-800/30 to-amber-950/30 backdrop-blur-sm"></div>

      {/* Inner decorative elements - corners */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-500"></div>
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-500"></div>
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-500"></div>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-500"></div>

      {/* Gold accent lines */}
      <div className="absolute inset-0 -m-1 border border-amber-400/50 rounded-md"></div>

      <Card className="overflow-hidden border-0 rounded-sm shadow-xl bg-black">
        {/* Image container */}
        <div className="relative w-full aspect-[2/3] overflow-hidden">
          <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] z-10 pointer-events-none"></div>
          <Image
            src={`/cards/${item.image}`}
            alt={"card image"}
            fill
            className="object-cover transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        </div>
      </Card>
    </div>
  );

  const header = useMemo(() => {
    switch (stage) {
      case "wait_for_story":
        if (amIStoryTeller) {
          return "Your turn to tell a story";
        } else {
          return "Waiting for the storyteller";
        }
      case "pick_card":
        return amIStoryTeller
          ? "Others are picking cards"
          : "Pick the card you think matches the story";
      case "wait_for_vote":
        return amIStoryTeller
          ? "The others are voting"
          : "Waiting for the votes. If you haven't voted, vote now!";
    }
  }, [amIStoryTeller, stage]);

  if (roomInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-row space-x-4">
            <div className="heading w-full">
              <h1 className="text-center text-amber-300 font-serif text-xl">
                {amIStoryTeller
                  ? "Your turn to tell a story"
                  : "Waiting for the storyteller"}
              </h1>
              <div className="text-center text-amber-300 font-serif text-sm">
                {roomInfo.message}
              </div>
              <div className="text-center text-amber-300 font-serif text-sm">
                {roomInfo.current} / {roomInfo.required}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-row space-x-4">
          <div className="heading w-full">
            <h1 className="text-center text-amber-300 font-serif text-xl">
              {header}
            </h1>
            {activeStory && (
              <div className="text-center text-amber-300 font-serif text-sm">
                The current story is: {activeStory}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-row space-x-4">
          {/* Players Row */}
          <div className="space-y-4">
            <h2 className="text-center text-amber-300 font-serif text-xl">
              Players
            </h2>
            <div className="flex justify-center ">
              <div className="flex flex-col space-y-8 align-items-center justify-center">
                {players.map((player) => (
                  <PlayerCard
                    key={player.name}
                    player={player}
                    isMe={me?.name === player.name}
                    flippedPlayer={flippedPlayer}
                    loaded={loaded}
                    handlePlayerClick={handlePlayerClick}
                    setFlippedPlayer={setFlippedPlayer}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Middle section - cards on table */}
          {stage === "wait_for_vote" && (
            <div className="space-y-6 w-full">
              {/* Top row - 3 cards */}
              <div className="flex justify-center">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl w-full">
                  {cardsOnTable.map((item, index) => (
                    <FrameComponent
                      key={item.id}
                      item={item}
                      cardIndex={index + 3}
                      onClick={
                        stage === "wait_for_vote"
                          ? () => handleCardClick(item)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom section - 6 cards */}
        <div className="space-y-6 ">
          <h2 className="text-left text-amber-300 font-serif text-xl">
            Your Cards
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-8 ">
            {myCards.map((item, index) => (
              <FrameComponent
                key={item.id}
                item={item}
                cardIndex={index + 5}
                onClick={
                  (stage === "pick_card" && !amIStoryTeller) ||
                  (stage === "wait_for_story" && amIStoryTeller)
                    ? () => handleCardClick(item)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {selectedCard !== null && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative max-w-2xl mx-auto animate-in zoom-in-95 duration-500"
            style={{
              transformOrigin: `${animationOrigin.x}px ${animationOrigin.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute -top-4 -right-4 z-10 bg-amber-600 hover:bg-amber-700 text-white rounded-full p-2 transition-colors duration-200 shadow-lg z-50"
            >
              <X size={20} />
            </button>

            {/* Large framed card */}
            <div className="relative w-200px h-200px">
              {/* Outer decorative frame */}
              <div className="absolute inset-0 -m-6 border-8 border-amber-700/80 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.8)] bg-gradient-to-br from-amber-800/30 to-amber-950/30 backdrop-blur-sm"></div>

              {/* Corner decorations */}
              <div className="absolute -top-3 -left-3 w-12 h-12 border-t-4 border-l-4 border-amber-500"></div>
              <div className="absolute -top-3 -right-3 w-12 h-12 border-t-4 border-r-4 border-amber-500"></div>
              <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b-4 border-l-4 border-amber-500"></div>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-4 border-r-4 border-amber-500"></div>

              {/* Gold accent lines */}
              <div className="absolute inset-0 -m-2 border border-amber-400/50 rounded-md"></div>

              <Card className="overflow-hidden border-0 rounded-sm shadow-2xl bg-black">
                {/* Image container */}
                <div className="relative w-full aspect-[2/3] overflow-hidden">
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] z-10 pointer-events-none"></div>
                  <Image
                    src={`/cards/${selectedCard.image}`}
                    fill
                    alt={"currently selected card"}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 700px"
                    priority
                  />
                </div>
              </Card>

              {/* Decorative corner flourishes */}
              <div className="absolute -top-8 -left-8 w-16 h-16 border-t-2 border-l-2 border-amber-300/50 rounded-tl-lg"></div>
              <div className="absolute -top-8 -right-8 w-16 h-16 border-t-2 border-r-2 border-amber-300/50 rounded-tr-lg"></div>
              <div className="absolute -bottom-8 -left-8 w-16 h-16 border-b-2 border-l-2 border-amber-300/50 rounded-bl-lg"></div>
              <div className="absolute -bottom-8 -right-8 w-16 h-16 border-b-2 border-r-2 border-amber-300/50 rounded-br-lg"></div>
            </div>

            {/* Story input section for storytellers */}
            {amIStoryTeller && stage === "wait_for_story" && (
              <div className="mt-6 p-4 bg-gradient-to-br from-amber-900/40 to-amber-950/40 backdrop-blur-sm rounded-lg border border-amber-700/50">
                <form onSubmit={handleStorySubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="story-input"
                      className="block text-amber-300 font-serif text-sm mb-2"
                    >
                      What is your story for this card?
                    </label>
                    <textarea
                      id="story-input"
                      value={storyInput}
                      onChange={(e) => setStoryInput(e.target.value)}
                      placeholder="Tell your story..."
                      required
                      className="w-full px-3 py-2 bg-slate-800/70 border border-amber-600/50 rounded-md text-amber-100 placeholder-amber-400/50 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                      rows={3}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!storyInput.trim()}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:from-amber-800/50 disabled:to-amber-900/50 disabled:cursor-not-allowed text-white font-serif px-6 py-3 rounded-md transition-all duration-200 shadow-lg disabled:shadow-none"
                  >
                    Pick
                  </button>
                </form>
              </div>
            )}

            {/* Pick card section for non-storytellers during pick_card stage */}
            {!amIStoryTeller && stage === "pick_card" && (
              <div className="mt-6 p-4 bg-gradient-to-br from-amber-900/40 to-amber-950/40 backdrop-blur-sm rounded-lg border border-amber-700/50">
                <div className="space-y-4">
                  <p className="text-amber-300 font-serif text-sm text-center">
                    Do you want to pick this card for the story?
                  </p>
                  <button
                    onClick={() => {
                      onSendPickCard(selectedCard.id);
                      closeModal();
                    }}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-serif px-6 py-3 rounded-md transition-all duration-200 shadow-lg"
                  >
                    Pick This Card
                  </button>
                </div>
              </div>
            )}

            {/* Vote section for wait_for_vote stage */}
            {stage === "wait_for_vote" && !amIStoryTeller && (
              <div className="mt-6 p-4 bg-gradient-to-br from-amber-900/40 to-amber-950/40 backdrop-blur-sm rounded-lg border border-amber-700/50">
                <div className="space-y-4">
                  <p className="text-amber-300 font-serif text-sm text-center">
                    Do you think this card matches the story?
                  </p>
                  <button
                    onClick={() => {
                      onSendVote(selectedCard.id);
                      closeModal();
                    }}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-serif px-6 py-3 rounded-md transition-all duration-200 shadow-lg"
                  >
                    Vote for This Card
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
