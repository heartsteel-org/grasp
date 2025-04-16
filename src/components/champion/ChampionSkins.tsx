import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChampionCard from "./ChampionCard";
import ChampionDialog from "./ChampionDialog";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { Skin } from "@/types/skin";

const ChampionSkins = ({ championName }: { championName: string }) => {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState<string | undefined>();

  useEffect(() => {
    const fetchSkins = async () => {
      try {
        setLoading(true);

        const versionRes = await fetch(
          "https://ddragon.leagueoflegends.com/api/versions.json"
        );
        const versions = await versionRes.json();
        const version = versions[0];

        const res = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${championName}.json`
        );
        const data = await res.json();
        const champion = data.data[championName];

        const skinsWithImages: Skin[] = champion.skins.map((skin: any) => ({
          id: skin.id,
          name: skin.name === "default" ? championName : skin.name,
          num: skin.num,
          image: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_${skin.num}.jpg`,
          splashUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg`,
          championId: champion.id,
          championKey: champion.key,
        }));

        setSkins(skinsWithImages);
      } catch (error) {
        console.error("Failed to fetch skins:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkins();
  }, [championName]);

  useEffect(() => {
    const unlisten = listen<string>("load_status", (event) => {
      setStatus(event.payload);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center min-h-[400px]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full"
            />
          </motion.div>
        ) : (
          <motion.div
            key="skins"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {skins
              .filter((skin) => skin.num !== 0)
              .map((skin, index) => (
                <motion.div
                  key={skin.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => {
                    setSelectedSkin(skin);
                    setDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <ChampionCard
                    name={skin.name}
                    image={skin.image}
                    championId={skin.championId}
                    skinId={skin.num.toString()}
                    championKey={skin.championKey}
                  />
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedSkin && (
        <ChampionDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setStatus(undefined);
          }}
          skinName={selectedSkin.name}
          splashUrl={selectedSkin.splashUrl}
          onLoad={async () => {
            try {
              await invoke("load_default_skin", {
                skinId: selectedSkin.num,
                championId: selectedSkin.championKey,
              });
              console.log("Skin installed successfully");
            } catch (err) {
              console.error("Error installing skin:", err);
            } finally {
              //setDialogOpen(false);
              //setStatus(undefined);
            }
          }}
          status={status}
        />
      )}
    </div>
  );
};

export default ChampionSkins;
