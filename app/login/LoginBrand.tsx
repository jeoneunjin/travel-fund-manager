import { Compass } from "lucide-react";

export function LoginBrand() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">트래블펀드</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        함께 모으고, 함께 쓰고, 깔끔하게 정산하세요.
      </p>
    </div>
  );
}
