import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 glass-panel">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            The structural element you are looking for has collapsed or does not exist.
          </p>

          <div className="mt-8">
            <Link href="/" className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors">
              Return to Safety
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
