import React, { useEffect, useState } from "react";
import {
  Canvas,
  Mask,
  Group,
  Circle,
  Rect,
  Text,
  useFont,
  Fill,
  RadialGradient,
  vec,
} from "@shopify/react-native-skia";
import {
  useWindowDimensions,
  View,
  Text as RNText,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  useSharedValue,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";
import { Audio } from "expo-av";

export default function IntroComponent({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const r = useSharedValue(0); // Радиус маски
  const opacity = useSharedValue(0); // Прозрачность текста
  const buttonOpacity = useSharedValue(0); // Прозрачность кнопки
  const [showButton, setShowButton] = useState(false); // Состояние для кнопки
  const [isAnimatingOut, setIsAnimatingOut] = useState(false); // Состояние для обратной анимации
  const [fontLoaded, setFontLoaded] = useState(false); // Состояние загрузки шрифта

  const fontSize = 42;
  const font = useFont(
    require("./../assets/fonts/PonomarUnicode.otf"),
    fontSize
  );

  // Текст для анимации
  const text = "100 лет отцу Борису";
  const textWidth =
    fontLoaded && font
      ? font.getGlyphWidths(font.getGlyphIDs(text)).reduce((a, b) => a + b, 0)
      : 0; // Измерение ширины текста
  const textX = (width - textWidth) / 2; // Центрирование по горизонтали
  const textY = height / 2; // Центрирование по вертикали

  // Звуковые эффекты
  const [waveSound, setWaveSound] = useState<Audio.Sound | null>(null); // Типизация для waveSound
  const [swooshSound, setSwooshSound] = useState<Audio.Sound | null>(null); // Типизация для swooshSound

  // Загрузка шрифта
  useEffect(() => {
    if (font) {
      setFontLoaded(true);
    }
  }, [font]);

  // Загрузка звуков
  useEffect(() => {
    const loadSounds = async () => {
      const { sound: wave } = await Audio.Sound.createAsync(
        require("./../assets/wave.wav") // Изменено на .wav
      );
      const { sound: swoosh } = await Audio.Sound.createAsync(
        require("./../assets/swoosh.wav") // Изменено на .wav
      );
      setWaveSound(wave);
      setSwooshSound(swoosh);
    };

    loadSounds();

    return () => {
      // Проверка на null перед вызовом unloadAsync
      if (waveSound) {
        waveSound.unloadAsync();
      }
      if (swooshSound) {
        swooshSound.unloadAsync();
      }
    };
  }, []);

  // Анимация радиуса и прозрачности текста
  useEffect(() => {
    if (!fontLoaded || !font) return; // Не начинать анимацию, пока шрифт не загружен

    r.value = withTiming(Math.max(width, height) * 0.8, { duration: 2000 });
    opacity.value = withTiming(1, { duration: 2000 }, () => {
      // Через секунду после завершения анимации показываем кнопку
      setTimeout(() => {
        setShowButton(true);
        buttonOpacity.value = withTiming(1, { duration: 500 }); // Fade-in кнопки
      }, 1000);
    });

    // Воспроизведение звука набегающей волны
    if (waveSound) {
      waveSound.replayAsync();
    }
  }, [fontLoaded, font, waveSound]);

  // Обратная анимация при нажатии на кнопку
  const handleButtonPress = async () => {
    setIsAnimatingOut(true);
    buttonOpacity.value = withTiming(0, { duration: 1000 }); // Fade-out кнопки
    r.value = withTiming(0, { duration: 1000 }); // Обратная анимация радиуса
    opacity.value = withTiming(0, { duration: 1000 }, () => {
      // После завершения анимации вызываем колбэк
      setTimeout(() => onComplete(), 500);
    });

    // Воспроизведение звука резкого всасывания воздуха
    if (swooshSound) {
      await swooshSound.replayAsync();
    }
  };

  const animatedRadius = useDerivedValue(() => r.value);
  const animatedOpacity = useDerivedValue(() => opacity.value);
  const animatedButtonOpacity = useDerivedValue(() => buttonOpacity.value);

  // Если шрифт не загружен, показываем индикатор загрузки
  if (!fontLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <Fill color="black" />
        <Mask
          mode="luminance"
          mask={
            <Group>
              <Text
                x={textX}
                y={textY}
                color={`rgba(255, 255, 255, ${animatedOpacity.value})`}
                text={text}
                font={font}
              />
              <Circle cx={width / 2} cy={height / 2} r={animatedRadius}>
                <RadialGradient
                  c={vec(width / 2, height / 2)}
                  r={animatedRadius}
                  colors={[
                    "rgba(255, 255, 255, 0.8)",
                    "rgba(255, 255, 255, 0.4)",
                    "transparent",
                  ]}
                />
              </Circle>
            </Group>
          }
        >
          <Rect x={0} y={0} width={width} height={height} color="white" />
        </Mask>
      </Canvas>

      {/* Кнопка "начать" */}
      {showButton && (
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 50,
            alignSelf: "center",
            backgroundColor: "black",
            borderWidth: 2,
            borderColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: 25,
            paddingHorizontal: 30,
            paddingVertical: 15,
            opacity: animatedButtonOpacity.value, // Анимация прозрачности
          }}
          onPress={handleButtonPress}
          activeOpacity={0.7}
        >
          <RNText style={{ color: "white", fontSize: 18 }}>начать</RNText>
        </TouchableOpacity>
      )}
    </View>
  );
}
