
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Download, Copy, RefreshCw, AlertTriangle } from 'lucide-react';
import { MFAService } from '@/services/MFAService';

interface RecoveryCodesProps {
  onComplete?: () => void;
  showTitle?: boolean;
}

const RecoveryCodes: React.FC<RecoveryCodesProps> = ({ 
  onComplete, 
  showTitle = true 
}) => {
  const [codes, setCodes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateCodes();
  }, []);

  const generateCodes = async () => {
    setIsGenerating(true);
    try {
      const newCodes = await MFAService.generateRecoveryCodes();
      setCodes(newCodes);
      await MFAService.logMFAAction('recovery_codes_generated');
    } catch (error) {
      console.error('Error generating recovery codes:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate recovery codes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAllCodes = async () => {
    try {
      const codesText = codes.join('\n');
      await navigator.clipboard.writeText(codesText);
      toast({
        title: "Codes copied",
        description: "All recovery codes have been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the recovery codes.",
        variant: "destructive"
      });
    }
  };

  const downloadCodes = () => {
    const codesText = `PhomShah Recovery Codes\n\nGenerated: ${new Date().toLocaleDateString()}\n\n${codes.join('\n')}\n\nKeep these codes safe and secure. Each code can only be used once.`;
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'phomshah-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Codes downloaded",
      description: "Recovery codes have been saved to your device.",
    });
  };

  const handleComplete = () => {
    if (!hasAcknowledged) {
      toast({
        title: "Acknowledgment required",
        description: "Please confirm that you have saved your recovery codes.",
        variant: "destructive"
      });
      return;
    }

    onComplete?.();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Recovery Codes
          </CardTitle>
          <CardDescription>
            Save these codes in a secure location. Each code can only be used once.
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Store these codes safely. They are your only way to access your account if you lose your authenticator device.
          </AlertDescription>
        </Alert>

        {/* Recovery Codes Grid */}
        {codes.length > 0 && (
          <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
            {codes.map((code, index) => (
              <div
                key={index}
                className="text-center font-mono text-sm bg-background p-2 rounded border"
              >
                {code}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyAllCodes}
            disabled={codes.length === 0}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCodes}
            disabled={codes.length === 0}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={generateCodes}
          disabled={isGenerating}
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? "Generating..." : "Generate New Codes"}
        </Button>

        {/* Acknowledgment */}
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="acknowledge-codes"
            checked={hasAcknowledged}
            onChange={(e) => setHasAcknowledged(e.target.checked)}
            className="mt-1 rounded border-gray-300"
          />
          <label htmlFor="acknowledge-codes" className="text-sm text-muted-foreground">
            I have saved these recovery codes in a secure location and understand that each code can only be used once.
          </label>
        </div>

        {onComplete && (
          <Button
            onClick={handleComplete}
            disabled={!hasAcknowledged}
            className="w-full"
          >
            Continue
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RecoveryCodes;
