import { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import type { ChampionSidebarProps } from "@/types/ui";
import type { Champion } from "@/types/champion";

const ChampionSidebar = ({
  onSelectChampion,
  selectedChampionId,
}: ChampionSidebarProps) => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchChampions = async () => {
      const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
      const versions = await versionRes.json();
      const version = versions[0];

      const res = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
      );
      const data = await res.json();

      const loadedChampions: Champion[] = Object.values(data.data).map((champ: any) => ({
        id: champ.id,
        name: champ.name,
        icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.id}.png`,
      }));

      setChampions(loadedChampions);
    };

    fetchChampions();
  }, []);

  const filteredChampions = champions.filter((champ) =>
    champ.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 glass rounded-lg p-6 flex flex-col gap-4 height-full">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
        <Input
          placeholder="Search champions..."
          className="pl-9 bg-white/5 border-white/10 focus-visible:ring-0 focus-visible:border-white/20 placeholder:text-white/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {filteredChampions.map((champion) => {
            const isSelected = champion.id === selectedChampionId;

            return (
              <button
                key={champion.id}
                onClick={() => onSelectChampion(champion.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                  ${isSelected
                    ? "bg-white/10 border border-white/20"
                    : "hover:bg-white/5"}`}
              >
                <img
                  src={champion.icon}
                  alt={champion.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className={`text-sm font-light tracking-wide ${isSelected ? "text-white" : "text-white/80"}`}>
                  {champion.name}
                </span>
              </button>
            );
          })}
          {filteredChampions.length === 0 && (
            <div className="text-sm text-white/50 text-center py-4">
              No champions found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChampionSidebar;
