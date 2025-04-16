import { useState } from "react";
import { Minimize2, X, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { getCurrentWindow } from "@tauri-apps/api/window";
import SettingsDialog from "./SettingsDialog";


const WindowControls = () => {
  const [showSettings, setShowSettings] = useState(false);
  const appWindow = getCurrentWindow();

  const handleMinimize = () => appWindow.minimize();
  const handleMaximize = () => appWindow.toggleMaximize();
  const handleClose = () => appWindow.close();

  return (
    <div data-tauri-drag-region className="flex items-center gap-1 pr-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-transparent hover:text-green-400"
        onClick={() => setShowSettings(true)}
      >
        <Settings className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-transparent hover:text-yellow-400"
        onClick={handleMinimize}
      >
        <Minimize2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-transparent hover:text-red-400"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
};

export default WindowControls;