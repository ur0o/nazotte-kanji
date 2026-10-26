import { Button, Stack, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
  return (
    <Stack align="center" py="xl">
      <Text>ページが見つかりません</Text>
      <Button renderRoot={(props) => <Link to="/" {...props} />}>
        トップへ
      </Button>
    </Stack>
  );
}
