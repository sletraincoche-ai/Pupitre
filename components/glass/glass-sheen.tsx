// Balayage lumineux très discret au survol — une bande fine qui traverse
// le bloc en diagonale, jamais scintillante (opacité volontairement
// faible, transition lente). À placer dans un ancêtre "group" avec
// overflow-hidden et une position relative.
export function GlassSheen() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/8 to-transparent opacity-0 transition-[left,opacity] duration-700 ease-out group-hover:left-[120%] group-hover:opacity-100" />
    </div>
  );
}
