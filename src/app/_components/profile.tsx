import Links from '@/components/links';

export default function Profile() {
  return (
    <div className="flex flex-col justify-center min-h-screen px-4 sm:px-6">
      <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight break-words">
          Johanes Peter Vincentius
        </h1>
        <h2 className="identity-tag type-label py-1">Software Engineer</h2>
      </div>
      <div className="w-full flex justify-center sm:justify-start mt-6 sm:mt-8">
        <Links />
      </div>
    </div>
  );
}
