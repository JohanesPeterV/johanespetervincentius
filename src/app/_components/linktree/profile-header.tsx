export default function ProfileHeader() {
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="identity-tag type-meta">Software engineer</p>
      <h1 className="profile-name">Johanes Peter Vincentius</h1>
      <p className="text-sm text-muted-foreground">
        Building things for the web
      </p>
    </div>
  );
}
