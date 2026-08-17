import { CertificationManager } from "@/components/admin/certification-manager";
import { getCertificationsForAdmin } from "@/features/certifications/queries";

export default async function AdminCertificationsPage() {
  const certifications = await getCertificationsForAdmin();
  return <CertificationManager certifications={certifications} />;
}
