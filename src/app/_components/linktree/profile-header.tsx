export default function ProfileHeader() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="profile-monogram flex h-12 w-12 items-center justify-center">
        J
      </div>
      <div className="flex flex-col items-center gap-3">
        <h1 className="profile-name">Johanes Peter Vincentius</h1>
        <p className="text-sm text-muted-foreground">
          Building things for the web
        </p>
      </div>
    </div>
  );
}
