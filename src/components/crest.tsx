export function UniversityCrest({
  height = 240,
}: {
  height?: number;
}) {
  return (
    <img
      src="/images/bu-crest.png"
      alt="Bahria University"
      width={Math.round(height * 0.84)}
      height={height}
      draggable={false}
      className="block select-none bg-transparent drop-shadow-xl"
      style={{ height, width: "auto", animation: "none", transform: "none" }}
    />
  );
}
