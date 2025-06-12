"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoomsPage() {
  const router = useRouter();
  const [joinRoomId, setJoinRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [numberOfPlayers, setNumberOfPlayers] = useState("");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            Storytelling Rooms
          </h1>
          <p className="text-slate-300 text-lg">
            Create or join a room to begin your storytelling adventure
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 ">
          <Card className="bg-slate-800/50 border-2 py-8 border-blue-600/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Join Room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="playerName" className="text-slate-300">
                  Your Name
                </Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name..."
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="joinRoomId" className="text-slate-300">
                  Room ID
                </Label>
                <Input
                  id="joinRoomId"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="Enter room ID..."
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="numberOfPlayers" className="text-slate-300">
                  Number of Players
                </Label>
                <Input
                  id="numberOfPlayers"
                  value={numberOfPlayers}
                  onChange={(e) => setNumberOfPlayers(e.target.value)}
                  placeholder="Enter number of players..."
                  type="number"
                  min="2"
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
                Join Room
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
