import WindowControls from "./WindowControls";

const Navbar = () => {
  return (
    <header
      data-tauri-drag-region
      className="fixed top-0 left-0 right-0 h-[32px] px-4 flex items-center bg-[#1e1e1e] z-50"
    >
      <h1 className="text-sm font-light tracking-wide text-white select-none">
        Grasp
      </h1>
      <div className="ml-auto">
        <WindowControls />
      </div>
    </header>
  );
};

export default Navbar;
