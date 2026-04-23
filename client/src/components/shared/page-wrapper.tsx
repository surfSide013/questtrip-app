import Navbar from "@/components/shared/navbar";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageWrapper — обёртка для всех страниц.
 * Добавляет Navbar сверху и минимальную высоту экрана.
 * Использование: <PageWrapper>...</PageWrapper>
 */
export default function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <Navbar />
      {children}
    </div>
  );
}
