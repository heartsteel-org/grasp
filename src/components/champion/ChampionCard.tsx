import React from "react";
import type { SkinCardProps } from "@/types/ui";

const ChampionCard = ({
  championId,
  skinId,
  name,
  image,
  championKey,
}: SkinCardProps) => {
  const handleClick = () => {
    console.log({
      championId,
      skinId,
      name,
      image,
      championKey,
    });
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="aspect-[2/4] relative overflow-hidden rounded-lg">
        <img
          src={image}
          alt={name}
          className="scale-105 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-sm font-light tracking-wide text-white truncate">{name}</h3>
        </div>
      </div>
    </div>
  );
};

export default ChampionCard;
