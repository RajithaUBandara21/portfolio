import { ProjectForm } from "@/components/admin/project-form";
import { getSkillOptions, getTechnologyOptions } from "@/features/projects/queries";
import type { ProjectInput } from "@/schemas/project.schema";

const emptyProject: ProjectInput = {
  slug: "",
  title: "",
  shortDescription: "",
  fullDescription: "",
  categories: [],
  status: "PLANNED",
  contentStatus: "DRAFT",
  featured: false,
  startDate: "",
  endDate: "",
  githubUrl: "",
  demoUrl: "",
  docsUrl: "",
  problem: "",
  solution: "",
  architectureNotes: "",
  challenges: "",
  results: "",
  lessons: "",
  futureImprovements: "",
  reliabilityNotes: "",
  securityNotes: "",
  observabilityNotes: "",
  testingNotes: "",
  technologyNames: [],
  skillIds: [],
  screenshots: [],
  metrics: [],
  decisions: [],
  archNodes: [],
  archEdges: [],
};

export default async function NewProjectPage() {
  const [technologyOptions, skillOptions] = await Promise.all([
    getTechnologyOptions(),
    getSkillOptions(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New project</h1>
      <ProjectForm
        defaultValues={emptyProject}
        technologyOptions={technologyOptions}
        skillOptions={skillOptions}
      />
    </div>
  );
}
