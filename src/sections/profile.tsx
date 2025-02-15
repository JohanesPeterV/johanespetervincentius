import RandomColorButton from "@/components/theme-buttons/random-color-button";

export default function Profile() {
  return (
    <div>
      <h1
        className="  scroll-m-20
      font-poppins text-4xl font-bold
      tracking-tight lg:text-6xl
animate-gradient      text-transparent bg-red bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 bg-clip-text

      "
      >
        J
        <RandomColorButton className="text-4xl lg:text-6xl font-extrabold p-0" />
        hanes Peter Vincentius
        <br />
      </h1>
    </div>
  );
}
