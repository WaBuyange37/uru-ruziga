import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Award, Download, Eye } from 'lucide-react'
import { Modal } from "../ui/modal"

export function CertificateDisplay() {
  const [showCertificate, setShowCertificate] = useState(false)

  const certificateData = {
    studentName: "Kwizera Mugisha",
    courseName: "Umwero Basics",
    completionDate: "June 15, 2025",
    certificateId: "UMW-2025-001"
  }

  const handleDownload = () => {
    // In a real application, this would generate and download a PDF
    alert("Downloading certificate...")
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#8B4513]">Your Certificates</h2>
      <Card className="bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513] flex items-center gap-2">
            <Award className="h-6 w-6" />
            Umwero Basics Certification
          </CardTitle>
          <CardDescription className="text-[#D2691E]">
            Completed on: {certificateData.completionDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[#8B4513] mb-4">
            Congratulations on completing the Umwero Basics course! You can now view or download your digital certificate.
          </p>
          <div className="flex justify-between">
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowCertificate(true)}
            >
              <Eye className="h-5 w-5" />
              View Certificate
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5" />
              Download Certificate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={showCertificate} onClose={() => setShowCertificate(false)} title="Digital Certificate">
        <div className="bg-white p-8 rounded-lg shadow-lg border-8 border-double border-[#8B4513]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#8B4513] mb-4">Certificate of Completion</h1>
            <p className="text-xl text-[#D2691E] mb-8">This certifies that</p>
            <p className="text-3xl font-bold text-[#8B4513] mb-8">{certificateData.studentName}</p>
            <p className="text-xl text-[#D2691E] mb-8">has successfully completed the course</p>
            <p className="text-3xl font-bold text-[#8B4513] mb-8">{certificateData.courseName}</p>
            <p className="text-xl text-[#D2691E] mb-8">on {certificateData.completionDate}</p>
            <div className="mt-16 flex justify-between items-center">
              <div className="text-left">
                <p className="text-[#8B4513] font-bold">Certificate ID:</p>
                <p className="text-[#D2691E]">{certificateData.certificateId}</p>
              </div>
              <div className="text-right">
                <p className="text-[#8B4513] font-bold">Authorized Signature</p>
                <img src="/signature.png" alt="Authorized Signature" className="h-16 mt-2" />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

