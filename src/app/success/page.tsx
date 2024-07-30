import MessagePage from "~/app/_components/MessagePage";

export default function SuccessPage() {
  return (
    <MessagePage
      title="Payment Successful!"
      message="Thank you for your purchase. Your subscription has been activated."
    />
  );
}