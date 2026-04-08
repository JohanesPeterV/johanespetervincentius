import Links from '@/components/links';
import RandomColorButton from '@/components/theme-buttons/random-color-button';

const Profile = (): React.JSX.Element => {
  return (
    <div className="flex flex-col justify-center min-h-screen px-4 sm:px-6">
      <div
        className={`
          text-transparent bg-gradient-to-r 
          from-foreground via-primary to-muted-foreground
          animate-gradient bg-clip-text
          flex flex-col gap-2 sm:gap-3
          text-center sm:text-left
        `}
      >
        <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight break-words">
          J
          <RandomColorButton className="text-2xl xs:text-3xl sm:text-4xl lg:text-6xl font-extrabold" />
          hanes Peter Vincentius
        </h1>
        <h2 className="text-base xs:text-lg sm:text-xl lg:text-2xl tracking-tight">
          Lead Software Engineer
        </h2>
      </div>
      <p className="mt-6 max-w-3xl text-center text-sm text-foreground/80 sm:text-left sm:text-base lg:text-lg">
        Turning messy business operations into reliable products with strong
        technical judgment, fast execution, and AI-native workflows.
      </p>
      <div className="w-full flex justify-center sm:justify-start mt-6 sm:mt-8">
        <Links iconSize={32} />
      </div>
    </div>
  );
};

export default Profile;
