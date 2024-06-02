export const metadata = {
  title: "Anonymous Msg",
  description: "Real feedback from anonymous person",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
