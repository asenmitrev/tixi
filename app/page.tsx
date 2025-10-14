"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, RefreshCw, Play } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActiveRoom {
  roomId: string;
  players: Array<{
    socketId: string;
    ref: string;
    hello?: string;
  }>;
  disconnected: unknown[];
  roomData: {
    roomId: string;
    id: string;
    numberOfPlayers: string;
  };
}

export default function RoomsPage() {
  const router = useRouter();
  const [joinRoomId, setJoinRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [numberOfPlayers, setNumberOfPlayers] = useState("");
  const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingJoinRoomId, setPendingJoinRoomId] = useState<string | null>(
    null
  );
  const playerNameInputRef = useRef<HTMLInputElement>(null);

  const fetchActiveRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("https://starfish-app-sdpej.ondigitalocean.app/games");//https://starfish-app-sdpej.ondigitalocean.app/games

      if (!response.ok) {
        throw new Error(`Грешка със зареждането на активни стаи: ${response.status}`);
      }

      const data = await response.json();
      // Use the actual API response structure
      setActiveRooms(data.rooms || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не успя да заредиш активни стаи"
      );
      console.error("Има грешка със зареждането на активни стаи:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRooms();
  }, []);

  const joinRoom = () => {
    if (!joinRoomId.trim() || !playerName.trim() || !numberOfPlayers.trim())
      return;

    // Redirect to the room with URL parameters
    router.push(
      `/rooms/${joinRoomId}?name=${encodeURIComponent(
        playerName
      )}&roomId=${encodeURIComponent(
        joinRoomId
      )}&numberOfPlayers=${encodeURIComponent(numberOfPlayers)}`
    );
  };

  const joinActiveRoom = (roomId: string) => {
    if (!playerName.trim()) {
      setPendingJoinRoomId(roomId);
      playerNameInputRef.current?.focus();
      return;
    }
    console.log(roomId, )
    router.push(
      `/rooms/${roomId}?name=${encodeURIComponent(
        playerName
      )}&roomId=${encodeURIComponent(
        roomId
      )}&numberOfPlayers=${encodeURIComponent(
        // Get numberOfPlayers from the room data
        activeRooms.find((room) => room.roomId === roomId)?.roomData
          ?.numberOfPlayers || "3"
      )}`
    );
  };

  // Watch for playerName being filled after a pending join
  useEffect(() => {
    if (pendingJoinRoomId && playerName.trim()) {
      joinActiveRoom(pendingJoinRoomId);
      setPendingJoinRoomId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            Лоби
          </h1>
          <p className="text-slate-300 text-lg">
            Създай стая или се включи в такава и започни играта!
          </p>
        </div>

        {/* Player Name Card */}
        <Card className="mb-8 py-4 bg-slate-800/50 border-2 border-yellow-400/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              Твоето име
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              id="playerName"
              ref={playerNameInputRef}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Въведи име..."
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-yellow-500"
            />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Rooms Section */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-2 py-8 border-green-600/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Активни стаи
              </CardTitle>
              <Button
                onClick={fetchActiveRooms}
                variant="outline"
                size="sm"
                className="border-green-600/50 text-green-400 hover:bg-green-600/20"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                  <p className="text-slate-300 mt-2">Зарежда активни стаи...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <p className="text-red-400 mb-2">Грешка със зареждането на стаи</p>
                  <p className="text-slate-400 text-sm">{error}</p>
                  <Button
                    onClick={fetchActiveRooms}
                    variant="outline"
                    size="sm"
                    className="mt-2 border-red-600/50 text-red-400 hover:bg-red-600/20"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {!loading && !error && activeRooms.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400">Няма активни стаи</p>
                  <p className="text-slate-500 text-sm mt-1">
                    Направи нова стая, за да започнеш!
                  </p>
                </div>
              )}

              {!loading && !error && activeRooms.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activeRooms.map((room) => {
                    const isRoomFull =
                      (room.players?.length || 0) >=
                      Number(room.roomData?.numberOfPlayers || 2);
                    return (
                      <div
                        key={room.roomId}
                        className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex items-center justify-between hover:bg-slate-700/70 transition-colors"
                      >
                        <div>
                          <h3 className="text-white font-medium">
                            Стая {room.roomId}
                          </h3>
                          <p className="text-slate-300 text-sm">
                            Номер на стаята: {room.roomData?.id}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {room.players?.length || 0}/
                            {room.roomData?.numberOfPlayers || "?"} players
                          </p>
                          {room.players && room.players.length > 0 && (
                            <p className="text-slate-500 text-xs mt-1">
                              Играчи:{" "}
                              {room.players.map((p) => p.ref).join(", ")}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => joinActiveRoom(room.roomId)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={!playerName.trim() || isRoomFull}
                        >
                          {isRoomFull ? "Пълна" : "Влез"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {!playerName.trim() && activeRooms.length > 0 && !loading && (
                <p className="text-amber-400 text-sm text-center">
                  Въведи името си, за да играеш в някоя от активните стаи
                </p>
              )}
            </CardContent>
          </Card>

          {/* Create Room Section */}
          <Card className="bg-slate-800/50 border-2 py-8 border-blue-600/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Създай стая
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="joinRoomId" className="text-slate-300">
                  Номер на стая
                </Label>
                <Input
                  id="joinRoomId"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="Въведи име на стая..."
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="numberOfPlayers" className="text-slate-300">
                  Брой играчи
                </Label>
                <Input
                  id="numberOfPlayers"
                  value={numberOfPlayers}
                  onChange={(e) => setNumberOfPlayers(e.target.value)}
                  placeholder="Въведи брой играчи..."
                  type="number"
                  min="3"
                  max="8"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={joinRoom}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                disabled={
                  !joinRoomId.trim() ||
                  !playerName.trim() ||
                  !numberOfPlayers.trim()
                }
              >
                Създай Стая
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
