import { Card } from '@/components/ui/card';

import ContactIcons from './contact-icons';
import LinkButtons from './link-buttons';
import ProfileHeader from './profile-header';

export default function ClassicCard() {
  return (
    <div className="pointer-events-auto relative z-10 mx-auto w-full max-w-md">
      <Card className="profile-card relative overflow-hidden p-6 sm:p-8">
        <div className="flex w-full flex-col items-center gap-6">
          <ProfileHeader />
          <LinkButtons />
          <ContactIcons />
        </div>
      </Card>
    </div>
  );
}
