import ThemeRegistry from '@/components/ThemeRegistry';

export const metadata = {
  title: 'Smart Income & Expense Management',
  description: 'Manage your income and expenses smartly with analytics and reporting',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
