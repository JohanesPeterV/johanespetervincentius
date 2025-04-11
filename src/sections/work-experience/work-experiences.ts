import WorkExperience from '.';

type WorkExperience = {
  company: string;
  positions: {
    name: string;
    workPeriod: string;
    description: string;
  }[];
};
export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    company: 'Farmio',
    positions: [
      {
        name: 'Software Engineer',
        workPeriod: '2023-2024',
        description: `Responsible for database design, software maintenance and full stack software development.`,
      },
    ],
  },
  {
    company: 'Software Lab Center, Binus',
    positions: [
      {
        name: 'Database Administrator',
        workPeriod: '2021-2024',
        description: `Tasked to maintain application that supports transactional database operations such as score transfer procedure`,
      },
      {
        name: 'Teaching Assistant',
        workPeriod: '2020-2021',
        description: `Responsible for teaching students in programming-based practicum subjects, also created application for Practicum needs.`,
      },
    ],
  },
];
