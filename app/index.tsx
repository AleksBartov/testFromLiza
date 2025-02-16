import IntroComponent from "@/components/IntroComponent";
import { useState } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <View style={{ flex: 1 }}>
      {showIntro ? (
        <IntroComponent onComplete={() => setShowIntro(false)} />
      ) : (
        <Text>Основной контент приложения</Text>
      )}
    </View>
  );
}
