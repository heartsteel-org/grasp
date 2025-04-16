"use client";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Button } from "@/components/ui/button";
import ChampionSidebar from "@/components/champion/ChampionSidebar";
import ChampionSkins from "@/components/champion/ChampionSkins";
import LoadingScreen from "@/components/common/LoadingScreen";
import Navbar from "@/components/common/Navbar";
import { PlusCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import type { LoadingStatus } from "@/types";

const Index = () => {
  const [selectedChampion, setSelectedChampion] = useState<string>("Aatrox");
  const [status, setStatus] = useState<LoadingStatus | null>({
    message: "Initializing...",
  });
  const [isDownloading, setIsDownloading] = useState<boolean>(true);

  useEffect(() => {
    const setupListener = async () => {
      const unlisten = await listen<LoadingStatus>(
        "download_status",
        (event) => {
          console.log("Status update:", event.payload);
          setStatus(event.payload);

          if (event.payload.message === "Done") {
            setTimeout(() => {
              setStatus(null);
              setIsDownloading(false);
            }, 500);
          }
        }
      );

      return unlisten;
    };

    let unlistenFn: (() => void) | undefined;

    setupListener()
      .then((unlisten) => {
        unlistenFn = unlisten;
        return invoke("setup");
      })
      .catch((err) => {
        console.error("Error:", err);
        setStatus({ message: "Error: " + err });
      });

    return () => {
      if (unlistenFn) unlistenFn();
    };
  }, []);

  return (
    <>
      <AnimatePresence>{status && <LoadingScreen status={status} />}</AnimatePresence>

      {!status && (
        <div className="h-screen flex flex-col overflow-hidden">
          <Navbar />

          <div className="flex flex-1 overflow-hidden pt-[32px]">
            <ChampionSidebar
              onSelectChampion={setSelectedChampion}
              selectedChampionId={selectedChampion}
            />

            <main className="flex-1 glass rounded-lg p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-light tracking-wider">
                  Available Skins for {selectedChampion}
                </h2>
                { /*<Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 hover:bg-white/5"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Skin
                </Button> */}
              </div>
              <ChampionSkins championName={selectedChampion} />
            </main>
          </div>
        </div>
      )}
    </>
  );
};

export default Index;
