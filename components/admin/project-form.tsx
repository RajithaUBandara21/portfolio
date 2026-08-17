"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm, type Path } from "react-hook-form";
import { toast } from "sonner";

import { FileUploader } from "@/components/admin/file-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  archNodeKindValues,
  contentStatusValues,
  projectCategoryValues,
  type ProjectInput,
  projectSchema,
  projectStatusValues,
} from "@/schemas/project.schema";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/config/project";
import { createProjectAction, updateProjectAction } from "@/features/projects/actions";

interface TechnologyOption {
  id: string;
  name: string;
}
interface SkillOption {
  id: string;
  name: string;
}

const NARRATIVE_FIELDS: Array<{ key: Path<ProjectInput>; label: string; help?: string }> = [
  { key: "problem", label: "Problem" },
  { key: "solution", label: "Solution" },
  { key: "architectureNotes", label: "Architecture notes" },
  { key: "challenges", label: "Engineering challenges" },
  {
    key: "results",
    label: "Results",
    help: "Only real, measured outcomes — never invent numbers.",
  },
  { key: "lessons", label: "Lessons learned" },
  { key: "futureImprovements", label: "Future improvements" },
  {
    key: "reliabilityNotes",
    label: "Reliability",
    help: "Failure handling, retries, timeouts, health checks.",
  },
  {
    key: "securityNotes",
    label: "Security",
    help: "Auth, authorization, input validation, secrets.",
  },
  {
    key: "observabilityNotes",
    label: "Observability",
    help: "Logs, metrics, traces, dashboards, alerts.",
  },
  { key: "testingNotes", label: "Testing", help: "Unit, integration, e2e, load testing coverage." },
];

export function ProjectForm({
  defaultValues,
  projectId,
  technologyOptions,
  skillOptions,
}: {
  defaultValues: ProjectInput;
  projectId?: string;
  technologyOptions: TechnologyOption[];
  skillOptions: SkillOption[];
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(projectSchema), defaultValues });

  const screenshots = useFieldArray({ control, name: "screenshots" });
  const metrics = useFieldArray({ control, name: "metrics" });
  const decisions = useFieldArray({ control, name: "decisions" });
  const archNodes = useFieldArray({ control, name: "archNodes" });
  const archEdges = useFieldArray({ control, name: "archEdges" });

  const selectedCategories = watch("categories");
  const selectedSkillIds = watch("skillIds");
  const technologyNames = watch("technologyNames");
  const nodeKeys = watch("archNodes")
    .map((n) => n.key)
    .filter(Boolean);

  const [techInput, setTechInput] = useState("");

  async function onSubmit(values: ProjectInput) {
    setFormError(null);
    const result = projectId
      ? await updateProjectAction(projectId, values)
      : await createProjectAction(values);

    if (!result.success) {
      setFormError(result.error);
      return;
    }
    toast.success("Project saved");
    router.push(`/admin/projects/${result.data.id}`);
    router.refresh();
  }

  function toggleCategory(category: (typeof projectCategoryValues)[number]) {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setValue("categories", next, { shouldValidate: true });
  }

  function toggleSkill(skillId: string) {
    const next = selectedSkillIds.includes(skillId)
      ? selectedSkillIds.filter((id) => id !== skillId)
      : [...selectedSkillIds, skillId];
    setValue("skillIds", next, { shouldValidate: true });
  }

  function addTechnology() {
    const name = techInput.trim();
    if (!name || technologyNames.includes(name)) return;
    setValue("technologyNames", [...technologyNames, name], { shouldValidate: true });
    setTechInput("");
  }

  function removeTechnology(name: string) {
    setValue(
      "technologyNames",
      technologyNames.filter((n) => n !== name),
      { shouldValidate: true },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6" noValidate>
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="basics">
        <div className="overflow-x-auto pb-1">
          <TabsList>
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="content">Case study</TabsTrigger>
            <TabsTrigger value="tech">Tech &amp; skills</TabsTrigger>
            <TabsTrigger value="media">Screenshots</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="decisions">Decisions &amp; metrics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="basics" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title ? (
                <p className="text-destructive text-sm">{errors.title.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" {...register("slug")} />
              {errors.slug ? (
                <p className="text-destructive text-sm">{errors.slug.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="shortDescription">Short description</Label>
            <Input id="shortDescription" {...register("shortDescription")} />
            {errors.shortDescription ? (
              <p className="text-destructive text-sm">{errors.shortDescription.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="fullDescription">Full description</Label>
            <Textarea id="fullDescription" rows={5} {...register("fullDescription")} />
            {errors.fullDescription ? (
              <p className="text-destructive text-sm">{errors.fullDescription.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {projectCategoryValues.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {CATEGORY_LABELS[category]}
                </Badge>
              ))}
            </div>
            {errors.categories ? (
              <p className="text-destructive text-sm">{errors.categories.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Project status</Label>
              <Select
                defaultValue={defaultValues.status}
                onValueChange={(v) => setValue("status", v as ProjectInput["status"])}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusValues.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contentStatus">Publish status</Label>
              <Select
                defaultValue={defaultValues.contentStatus}
                onValueChange={(v) => setValue("contentStatus", v as ProjectInput["contentStatus"])}
              >
                <SelectTrigger id="contentStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentStatusValues.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 pb-2">
              <Checkbox
                id="featured"
                checked={watch("featured")}
                onCheckedChange={(checked) => setValue("featured", checked === true)}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input id="githubUrl" {...register("githubUrl")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="demoUrl">Demo URL</Label>
              <Input id="demoUrl" {...register("demoUrl")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="docsUrl">Docs URL</Label>
              <Input id="docsUrl" {...register("docsUrl")} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-5">
          {NARRATIVE_FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.help ? <p className="text-muted-foreground text-xs">{field.help}</p> : null}
              <Textarea id={field.key} rows={4} {...register(field.key)} />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="tech" className="space-y-6">
          <div className="space-y-2">
            <Label>Technologies</Label>
            <div className="flex gap-2">
              <Input
                list="technology-suggestions"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTechnology();
                  }
                }}
                placeholder="e.g. PostgreSQL"
              />
              <datalist id="technology-suggestions">
                {technologyOptions.map((t) => (
                  <option key={t.id} value={t.name} />
                ))}
              </datalist>
              <Button type="button" variant="outline" onClick={addTechnology}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {technologyNames.map((name) => (
                <Badge key={name} variant="secondary" className="gap-1">
                  {name}
                  <button
                    type="button"
                    onClick={() => removeTechnology(name)}
                    aria-label={`Remove ${name}`}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Skills used</Label>
            {skillOptions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No skills exist yet — add some under Skills in the admin nav.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant={selectedSkillIds.includes(skill.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleSkill(skill.id)}
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          {screenshots.fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3 rounded-lg border p-3">
              <FileUploader
                value={watch(`screenshots.${index}.url`)}
                onChange={(url) => setValue(`screenshots.${index}.url`, url)}
              />
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Alt text (required for accessibility)"
                  {...register(`screenshots.${index}.altText`)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => screenshots.remove(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              screenshots.append({ url: "", altText: "", order: screenshots.fields.length })
            }
          >
            Add screenshot
          </Button>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <div className="space-y-3">
            <Label>Nodes</Label>
            {archNodes.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-2 gap-2 rounded-lg border p-3 sm:grid-cols-4"
              >
                <Input placeholder="key (e.g. api)" {...register(`archNodes.${index}.key`)} />
                <Input placeholder="Label" {...register(`archNodes.${index}.label`)} />
                <Select
                  defaultValue={field.kind}
                  onValueChange={(v) =>
                    setValue(
                      `archNodes.${index}.kind`,
                      v as ProjectInput["archNodes"][number]["kind"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {archNodeKindValues.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Technology" {...register(`archNodes.${index}.technology`)} />
                <Input
                  className="col-span-2"
                  placeholder="Responsibility"
                  {...register(`archNodes.${index}.responsibility`)}
                />
                <Input
                  type="number"
                  placeholder="X position"
                  {...register(`archNodes.${index}.positionX`, { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  placeholder="Y position"
                  {...register(`archNodes.${index}.positionY`, { valueAsNumber: true })}
                />
                <div className="col-span-full flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => archNodes.remove(index)}
                  >
                    Remove node
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                archNodes.append({
                  key: "",
                  label: "",
                  kind: "SERVICE",
                  technology: "",
                  responsibility: "",
                  interfaces: [],
                  dependencies: [],
                  positionX: archNodes.fields.length * 200,
                  positionY: 0,
                })
              }
            >
              Add node
            </Button>
            <p className="text-muted-foreground text-xs">
              Positions are plain X/Y coordinates on the canvas — drag nodes on the public page
              isn&apos;t needed since layout is fixed per save.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Edges</Label>
            {archEdges.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-2 gap-2 rounded-lg border p-3 sm:grid-cols-4"
              >
                <Select
                  defaultValue={field.sourceKey}
                  onValueChange={(v) => setValue(`archEdges.${index}.sourceKey`, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Source node" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeKeys.map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  defaultValue={field.targetKey}
                  onValueChange={(v) => setValue(`archEdges.${index}.targetKey`, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Target node" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeKeys.map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Label" {...register(`archEdges.${index}.label`)} />
                <Input placeholder="Data flow" {...register(`archEdges.${index}.dataFlow`)} />
                <div className="col-span-full flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => archEdges.remove(index)}
                  >
                    Remove edge
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={nodeKeys.length < 2}
              onClick={() =>
                archEdges.append({
                  sourceKey: nodeKeys[0] ?? "",
                  targetKey: nodeKeys[1] ?? "",
                  label: "",
                  dataFlow: "",
                })
              }
            >
              Add edge
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-8">
          <div className="space-y-3">
            <Label>Technical decisions</Label>
            {decisions.fields.map((field, index) => (
              <div key={field.id} className="space-y-2 rounded-lg border p-3">
                <Input placeholder="Decision title" {...register(`decisions.${index}.title`)} />
                <Textarea
                  placeholder="Reason"
                  rows={2}
                  {...register(`decisions.${index}.reason`)}
                />
                <Textarea
                  placeholder="Alternatives considered"
                  rows={2}
                  {...register(`decisions.${index}.alternatives`)}
                />
                <Textarea
                  placeholder="Trade-offs"
                  rows={2}
                  {...register(`decisions.${index}.tradeoffs`)}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => decisions.remove(index)}
                  >
                    Remove decision
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                decisions.append({
                  title: "",
                  reason: "",
                  alternatives: "",
                  tradeoffs: "",
                  order: decisions.fields.length,
                })
              }
            >
              Add decision
            </Button>
          </div>

          <div className="space-y-3">
            <Label>Metrics</Label>
            <p className="text-muted-foreground text-xs">
              Real, measured numbers only — leave this empty rather than estimate.
            </p>
            {metrics.fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-3 gap-2 rounded-lg border p-3">
                <Input
                  placeholder="Label (e.g. p95 latency)"
                  {...register(`metrics.${index}.label`)}
                />
                <Input placeholder="Value (e.g. 120ms)" {...register(`metrics.${index}.value`)} />
                <Input placeholder="Context" {...register(`metrics.${index}.context`)} />
                <div className="col-span-full flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => metrics.remove(index)}
                  >
                    Remove metric
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                metrics.append({ label: "", value: "", context: "", order: metrics.fields.length })
              }
            >
              Add metric
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save project"}
      </Button>
    </form>
  );
}
