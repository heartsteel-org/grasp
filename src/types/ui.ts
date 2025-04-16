export type SkinCardProps = {
    championId: string;
    championKey: string;
    skinId: string;
    name: string;
    image: string;
  };
  
  export type ChampionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    skinName: string;
    splashUrl: string;
    onLoad: () => void;
    status?: string; 
  };
  
  export type LoadingStatus = {
    message: string;
    percent?: number;
    speed_mb_s?: number | null;
    downloaded_mb?: number | null;
    total_mb?: number | null;
  };

  export interface ChampionSidebarProps {
    onSelectChampion: (name: string) => void;
    selectedChampionId: string | null;
  }
  