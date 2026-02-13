import {
  Phone,
  CheckCircle2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TestCallCardProps } from "@/lib/interfaces";
import { ErrorAlert } from "../alert/error-alert";
import { SuccessAlert } from "../alert/sucess-alert";
import { LoadingSpinner } from "../loading-spinner";

/**
 * Renders a card UI for initiating a test call to preview an agent.
 *
 * @component
 * @param {Object} props - The props for the TestCallCard component.
 * @param {string} props.testFirstName - The first name input value for the test call.
 * @param {(value: string) => void} props.setTestFirstName - Callback to update the test first name.
 * @param {string} props.testLastName - The last name input value for the test call.
 * @param {(value: string) => void} props.setTestLastName - Callback to update the test last name.
 * @param {string} props.testGender - The gender input value for the test call.
 * @param {(value: string) => void} props.setTestGender - Callback to update the test gender.
 * @param {string} props.testPhone - The phone number input value for the test call.
 * @param {(value: string) => void} props.setTestPhone - Callback to update the test phone number.
 * @param {() => void} props.onStartTestCall - Handler function to initiate the test call.
 * @param {boolean} props.isTestCalling - Indicates if a test call is currently being initiated.
 * @param {string | null} props.testCallError - Error message to display if the test call fails.
 * @param {boolean} props.testCallSuccess - Indicates if the test call was initiated successfully.
 * @param {boolean} props.agentSaved - Indicates if the agent configuration has been saved.
 * @param {boolean} props.isSaving - Indicates if the agent configuration is currently being saved.
 *
 * @returns {JSX.Element} The rendered TestCallCard component.
 */
export function TestCallCard({
  testFirstName,
  setTestFirstName,
  testLastName,
  setTestLastName,
  testGender,
  setTestGender,
  testPhone,
  setTestPhone,
  onStartTestCall,
  isTestCalling,
  testCallError,
  testCallSuccess,
  agentSaved,
  isSaving,
}: TestCallCardProps) {
  return (
    <div className="lg:sticky lg:top-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Test Call
          </CardTitle>
          <CardDescription>
            {agentSaved
              ? "Make a test call to preview your agent."
              : "Save your agent first to enable test calls."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!agentSaved && (
              <ErrorAlert message="Save your agent configuration before testing." />
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="test-first-name">First Name</Label>
                <Input
                  id="test-first-name"
                  placeholder="John"
                  value={testFirstName}
                  onChange={(e) => setTestFirstName(e.target.value)}
                  disabled={!agentSaved || isSaving || isTestCalling}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-last-name">Last Name</Label>
                <Input
                  id="test-last-name"
                  placeholder="Doe"
                  value={testLastName}
                  onChange={(e) => setTestLastName(e.target.value)}
                  disabled={!agentSaved || isSaving || isTestCalling}
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="test-gender">Gender</Label>
              <Select value={testGender} onValueChange={setTestGender} disabled={!agentSaved || isSaving || isTestCalling}>
                <SelectTrigger id="test-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="test-phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <PhoneInput
                id="test-phone"
                defaultCountry="EG"
                value={testPhone}
                onChange={setTestPhone}
                placeholder="Enter phone number"
                disabled={!agentSaved || isSaving || isTestCalling}
              />
            </div>

            {testCallError && <ErrorAlert message={testCallError} />}

            {testCallSuccess && <SuccessAlert message="Test call initiated successfully!" />}

            {/* Test Call Button */}
            <Button
              className="w-full"
              onClick={onStartTestCall}
              disabled={isTestCalling || !agentSaved || isSaving}
            >
              {isTestCalling ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Starting Call...</span>
                </>
              ) : testCallSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Call Initiated!
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Start Test Call
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
