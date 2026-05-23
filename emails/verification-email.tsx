import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface VerificationEmailProps {
  name: string;
  verificationUrl: string;
}

export const VerificationEmail = ({
  name,
  verificationUrl,
}:VerificationEmailProps) => {
  const previewText = `Verify your email address for Anti-Ragging BD`;

  return (
    <Tailwind>
      <Html>
        <Head />
        <Body className="bg-[#f6f9fc] font-sans my-auto mx-auto px-2 sm:px-0 pt-[20px] pb-[20px] sm:pt-[40px] sm:pb-[40px]">
          <Preview>{previewText}</Preview>
          <Container className="mx-auto border border-solid border-[#e6ebf1] bg-white rounded-xl shadow-sm p-[20px] sm:p-[40px] w-full max-w-[465px] mt-[20px] mb-[40px]">
            <Section className="text-center">
              <Heading className="text-[28px] font-bold text-[#111827] m-0 tracking-tight">
                Anti-Ragging BD
              </Heading>
              <Text className="text-[#6b7280] text-[14px] mt-2 mb-0">
                Safe Campus Initiative
              </Text>
            </Section>

            <Hr className="border border-solid border-[#e6ebf1] my-[26px] mx-0 w-full" />

            <Heading className="text-[24px] font-semibold text-center p-0 my-[30px] mx-0 text-[#111827]">
              Verify your email address
            </Heading>

            <Text className="text-[16px] leading-[26px] text-[#374151]">
              Hello {name ? <strong className="font-semibold">{name}</strong> : 'there'},
            </Text>

            <Text className="text-[16px] leading-[26px] text-[#374151]">
              Thank you for joining the Anti-Ragging Portal. To complete your registration and help us ensure a secure environment, please verify your email address by clicking the button below.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#4f46e5] rounded-md text-white text-[15px] font-semibold no-underline text-center px-6 py-3 transition-colors hover:bg-[#4338ca]"
                href={verificationUrl}
              >
                Verify Email Address
              </Button>
            </Section>

            <Text className="text-[15px] leading-[24px] text-[#4b5563]">
              Or copy and paste this URL into your browser:
              <br />
              <Link
                href={verificationUrl}
                className="text-[#4f46e5] no-underline break-all text-[14px] mt-2 block"
              >
                {verificationUrl}
              </Link>
            </Text>

            <Hr className="border border-solid border-[#e6ebf1] my-[26px] mx-0 w-full" />

            <Text className="text-[13px] leading-[22px] text-[#6b7280]">
              If you didn't create an account with us, you can safely ignore this email.
            </Text>
            
            <Text className="text-[12px] leading-[20px] text-[#9ca3af] text-center mt-[30px]">
              © {new Date().getFullYear()} Anti-Ragging BD. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

VerificationEmail.PreviewProps = {
  username: 'Simran',
  verificationUrl: 'https://anti-ragging-bd.vercel.app/verify-email?token=sample-token-xyz-123',
};

export default VerificationEmail;
