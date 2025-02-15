import {
  Canvas,
  Mask,
  Group,
  Circle,
  Rect,
  Text,
  useFont,
  Fill,
} from "@shopify/react-native-skia";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";

export default function Index() {
  const { width, height } = useWindowDimensions();
  const r = useSharedValue(0);
  const fontSize = 42;
  const font = useFont(
    require("./../assets/fonts/PonomarUnicode.otf"),
    fontSize
  );

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="black" />
      <Mask
        mode="luminance"
        mask={
          <Group>
            <Text
              x={0}
              y={300}
              color="white"
              text="100 лет отцу Борису"
              font={font}
            />
            <Circle cx={width / 2} cy={height / 2} r={0} color="black" />
          </Group>
        }
      >
        <Rect x={0} y={0} width={width} height={height} color="white" />
      </Mask>
    </Canvas>
  );
}
