// web/pages/MeetTheTeamPage.tsx
import React, { useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';

type TeamMember = {
  id: string | number;
  name: string;
  position: string;
  role: string;
  imagePublicId?: string; // Cloudinary public ID (used to build URL)
  imageUrl?: string; // Optional direct URL override
  bio?: string;
  contact?: string;
};

const cloudinaryUrl = (publicId: string | undefined, options = '') =>
  publicId ? `https://res.cloudinary.com/unihousingmw/image/upload/${options}/${publicId}.jpg` : '';

const sampleTeam: TeamMember[] = [
  {
    id: 1,
    name: 'Angel T. Kautsi',
    position: 'Chaiperson',
    role: 'Club Chair, Strategy & Outreach',
    imagePublicId: 'v1763505591/LILZPICS052_anvt6m',
    bio: 'Aisha leads the club with a focus on community engagement and STEM outreach across the region.',
    contact: 'aisha@dmi-sjbu.edu',
  },
  {
    id: 2,
    name: 'Blessings Phiri',
    position: 'Vice Chairperson',
    role: 'Operations & Events',
    imagePublicId: 'dmi/team/peter_banda',
    bio: 'Peter coordinates events, manages logistics, and ensures smooth delivery on election days.',
    contact: 'peter@dmi-sjbu.edu',
  },
  {
    id: 3,
    name: 'Immanuel Gondwe',
    position: 'Secretary',
    role: 'Graphics Designer',
    imagePublicId: 'v1763505597/LILZPICS033_sgtsgs',
    bio: 'Lillian oversees platform development, security audits, and technical integrations.',
    contact: 'lillian@dmi-sjbu.edu',
  },
  {
    id: 4,
    name: 'Athony Phiri',
    position: 'Vice Secretary',
    role: 'Backend Developer',
    imagePublicId: 'v1763505599/LILZPICS028_owmga5',
    bio: 'Samuel crafts the club visual identity and ensures accessible, emotional design.',
    contact: 'samuel@dmi-sjbu.edu',
  },
    {
    id: 5,
    name: 'Jane Alex',
    position: 'Project Coordinator',
    role: 'Project Coordinator',
    imagePublicId: 'v1763505109/LILZPICS047_3_xho0xi',
    bio: 'Samuel crafts the club visual identity and ensures accessible, emotional design.',
    contact: 'samuel@dmi-sjbu.edu',
  },
      {
    id: 6,
    name: 'Benson Bauleni',
    position: 'Discipline Officer',
    role: 'Discipline Oficer',
    imagePublicId: 'v1763505109/LILZPICS030_w54dao',
    bio: 'Samuel crafts the club visual identity and ensures accessible, emotional design.',
    contact: 'samuel@dmi-sjbu.edu',
  },
      {
    id: 7,
    name: 'Yohane H. Maluwa',
    position: 'Comms Officer',
    role: 'Frontend Developer',
    imagePublicId: 'v1763505603/LILZPICS034_ta6x2n',
    bio: 'Finding residence in pixels.',
    contact: 'ymaluwa@outlook.com',
  },
      {
    id:8 ,
    name: 'Emmanuel Noel Kakwera',
    position: 'Member',
    role: 'Discipline Assistant and Security Officer',
    imagePublicId: 'dmi/team/samuel_zulu',
    bio: 'Samuel crafts the club visual identity and ensures accessible, emotional design.',
    contact: 'samuel@dmi-sjbu.edu',
  },
      {
    id: 9,
    name: 'Cedric Bakali',
    position: 'Member',
    role: 'Graphics designer',
    imagePublicId: 'dmi/team/samuel_zulu',
    bio: 'Samuel crafts the club visual identity and ensures accessible, emotional design.',
    contact: 'samuel@dmi-sjbu.edu',
  },
      {
    id: 10,
    name: 'Alfred ',
    position: 'Member',
    role: 'Frontend & Backend Assistant - Emotional Support',
    imagePublicId: 'dmi/team/samuel_zulu',
    bio: 'Samuel crafts the club visual identity and ensures accessible, emotional design.',
    contact: 'samuel@dmi-sjbu.edu',
  },
      {
    id: 11,
    name: 'Lester',
    position: 'Member',
    role: 'No Role Assigned',
    imagePublicId: 'dmi/team/samuel_zulu',
    bio: 'Samuel crafts the club visual identity and ensures accessible, emotional design.',
    contact: 'samuel@dmi-sjbu.edu',
  },
      {
    id: 12,
    name: 'Keith Chiwaula',
    position: 'Member',
    role: 'No Role Assigned',
    imagePublicId: 'dmi/team/samuel_zulu',
    bio: 'Samuel crafts the club visual identity and ensures accessible, emotional design.',
    contact: 'samuel@dmi-sjbu.edu',
  },
      {
    id: 13,
    name: 'Adam Wasili',
    position: 'Membber',
    role: 'No Role Assigned',
    imagePublicId: 'dmi/team/samuel_zulu',
    bio: 'Samuel crafts the club visual identity and ensures accessible, emotional design.',
    contact: 'samuel@dmi-sjbu.edu',
  },
      {
    id: 14,
    name: 'Akim Amini',
    position: 'Member',
    role: 'No Role Assigned',
    imagePublicId: 'v1763505104/LILZPICS056_1_nmxci7',
    bio: 'Samuel crafts the club visual identity and ensures accessible, emotional design.',
    contact: 'samuel@dmi-sjbu.edu',
  },
];

const MeetTheTeamPage: React.FC = () => {
  const [selected, setSelected] = useState<TeamMember | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <Card title="Meet The Team" className="max-w-6xl mx-auto">
        <p className="text-gray-700 mb-6">
          The DMI-SJBU Science & Engineering Club team that powers the election platform. Tap any member to view more details.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sampleTeam.map(member => {
            const img = member.imageUrl || cloudinaryUrl(member.imagePublicId, 'c_fill,g_auto,w_400,h_400,q_auto,f_auto');
            const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%236b7280">No Image</text></svg>';

            return (
              <button
                key={member.id}
                onClick={() => setSelected(member)}
                className="text-left bg-white rounded-lg shadow-sm p-3 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-dmi-blue-500 transition"
                aria-labelledby={`team-${member.id}-name`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={img || placeholder}
                      alt={`${member.name} photo`}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholder; }}
                    />
                  </div>

                  <div className="mt-3 text-center">
                    <h3 id={`team-${member.id}-name`} className="text-sm font-semibold text-dmi-blue-900">{member.name}</h3>
                    <p className="text-xs text-gray-500">{member.position}</p>
                    <p className="text-xs text-gray-400 mt-1">{member.role}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Want to join the team? Contact the Election Committee or use the Help Center.</p>
        </div>
      </Card>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? selected.name : ''}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={selected.imageUrl || cloudinaryUrl(selected.imagePublicId, 'c_fill,g_auto,w_600,h_600,q_auto,f_auto')}
                  alt={`${selected.name} photo`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width=\"600\" height=\"600\"><rect width=\"100%\" height=\"100%\" fill=\"%23e5e7eb\"/><text x=\"50%\" y=\"50%\" dominant-baseline=\"middle\" text-anchor=\"middle\" font-family=\"sans-serif\" font-size=\"20\" fill=\"%236b7280\">No Image</text></svg>'; }}
                />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-xl font-bold text-dmi-blue-900">{selected.name}</h4>
                <p className="text-sm text-gray-500">{selected.position} • <span className="text-dmi-blue-700 font-medium">{selected.role}</span></p>
                {selected.contact && <p className="text-sm text-gray-600 mt-2">Contact: <a className="text-dmi-blue-600 underline" href={`mailto:${selected.contact}`}>{selected.contact}</a></p>}
              </div>
            </div>

            <div className="pt-2">
              <h5 className="text-sm font-semibold text-dmi-blue-900">About {selected.name}</h5>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.bio || 'No biography available.'}</p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MeetTheTeamPage;
