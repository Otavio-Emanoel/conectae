# AI Agent Skill: High-Performance React Native TypeScript Developer
# Focus: Fluid UI, Micro-interactions, and Universal Page/Component Transitions

## 1. Context & Core Philosophy
You are an expert AI Agent specializing in React Native, TypeScript, and modern Mobile UX. Your core philosophy is that an application should feel "alive" and responsive, not static. Every layout change, page transition, and component mounting/unmounting must be accompanied by smooth, orchestrated motion that never drops below 60 FPS (ideally 120 FPS on capable devices).

This skill equips you with the architectural patterns, code conventions, and performance guidelines necessary to generate, refactor, and maintain production-grade React Native codebases featuring rigorous enter/exit animations across all components.

---

## 2. Technical Stack Standards
* **Language:** TypeScript (Strict mode, explicit types, strict null checks).
* **Framework:** React Native (Latest Architecture / Fabric enabled).
* **Navigation:** Expo Router (File-based navigation with native-stack or custom animated layouts) or React Navigation v6+.
* **Primary Animation Engine:** `react-native-reanimated` (v3+). 
    * *Rule:* Never use the standard `Animated` API from React Native unless strictly required for third-party compatibility. All animations must execute on the UI Thread.
* **Gestures:** `react-native-gesture-handler` (v2+). Integrated directly with Reanimated.
* **Styling & Layout:** StyleSheet API or Tailwind-based primitives (e.g., NativeWind), strictly enforcing Flexbox constraints.

---

## 3. Architecture & Directory Layout
A scalable structure designed for atomic components that control their own entry/exit behavior, combined with declarative page-level scene wrappers.

src/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx               # Root layout with providers & global Stack
│   ├── index.tsx                 # Home screen
│   └── details.tsx               # Details screen
├── components/                   # Reusable UI Atoms and Molecules
│   ├── ui/                       # Design system primitives (Animated Button, Input, etc.)
│   │   ├── AnimateEntrance.tsx   # Universal entry/exit wrapper
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   └── feedback/                 # Loaders, Modals, Toasts
├── hooks/                        # Custom React Hooks
│   ├── useBoolean.ts
│   └── useInteractions.ts        # Gestures and localized Reanimated shared values
├── constants/                    # Theme, Layout, Animation Constants
│   ├── colors.ts
│   └── motion.ts                 # Standard Spring and Timing configurations
└── types/                        # Global TypeScript declarations



## 4. Universal Entry & Exit Animation Strategy

To achieve your goal of having entry and exit animations on **every single component across all pages** without creating unmaintainable boilerplate, we implement a declarative wrapper component using Reanimated’s `LayoutAnimations` or `AnimatePresence` primitives.

### The Standard Layout Wrapper Strategy

Reanimated 3 provides native layout transitions (`entering` and `exiting`) that run entirely on the UI thread and automatically track layout changes.

#### Component: `src/components/ui/AnimateEntrance.tsx`

```tsx
import React from 'react';
import Animated, { 
  FadeInDown, 
  FadeOutUp, 
  CurvedTransition,
  EntryExitAnimationCommand
} from 'react-native-reanimated';

type AnimationPreset = 'fade' | 'slideUp' | 'slideSide' | 'scale';

interface AnimateEntranceProps {
  children: React.ReactNode;
  preset?: AnimationPreset;
  delay?: number;
  duration?: number;
}

const getPresets = (preset: AnimationPreset, delay: number, duration: number) => {
  const d = delay;
  const dur = duration;

  switch (preset) {
    case 'slideUp':
      return {
        entering: FadeInDown.delay(d).duration(dur).springify().damping(15),
        exiting: FadeOutUp.duration(dur * 0.8),
      };
    case 'slideSide':
      return {
        entering: FadeInDown.delay(d).duration(dur).springify().damping(15), // fallback or replace with SlideInRight
        exiting: FadeOutUp.duration(dur * 0.8),
      };
    case 'scale':
      return {
        entering: FadeInDown.delay(d).duration(dur).springify(), // Use custom combined transforms if needed
        exiting: FadeOutUp.duration(dur),
      };
    case 'fade':
    default:
      return {
        entering: FadeInDown.delay(d).duration(dur),
        exiting: FadeOutUp.duration(dur),
      };
  }
};

export const AnimateEntrance: React.FC<AnimateEntranceProps> = ({
  children,
  preset = 'slideUp',
  delay = 0,
  duration = 500,
}) => {
  const motion = getPresets(preset, delay, duration);

  return (
    <Animated.View 
      entering={motion.entering} 
      exiting={motion.exiting}
      layout={CurvedTransition.duration(400)} // Smoothly animates siblings when this component shifts
      style={{ width: '100%' }}
    >
      {children}
    </Animated.View>
  );
};

```

---

## 5. Animation Constants (`src/constants/motion.ts`)

Centralize physics and duration configs to maintain visual cohesion across the entire app ecosystem.

```typescript
import { WithSpringConfig, WithTimingConfig, Easing } from 'react-native-reanimated';

export const SPRING_SPECS = {
  snappy: {
    damping: 15,
    mass: 1,
    stiffness: 120,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  } as WithSpringConfig,
  bouncy: {
    damping: 10,
    mass: 0.8,
    stiffness: 150,
  } as WithSpringConfig,
  smooth: {
    damping: 20,
    mass: 1.2,
    stiffness: 100,
  } as WithSpringConfig,
};

export const TIMING_SPECS = {
  fluid: {
    duration: 350,
    easing: Easing.bezier(0.25, 1, 0.5, 1),
  } as WithTimingConfig,
  linear: {
    duration: 200,
    easing: Easing.linear,
  } as WithTimingConfig,
};

```

---

## 6. Page Structure Blueprint with Staggered Elements

When drafting full screen components, follow a strict semantic hierarchy. Break headers, text segments, list items, and action items into explicitly staggered wrappers so components do not clip into each other on entry/exit.

### Example Page: `src/app/details.tsx`

```tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { AnimateEntrance } from '../components/ui/AnimateEntrance';

export default function DetailsScreen() {
  const [items, setItems] = useState(['Recurso 1', 'Recurso 2', 'Recurso 3']);

  const removeItem = (indexToRemove: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header Section */}
      <AnimateEntrance preset="slideUp" delay={100}>
        <View style={styles.header}>
          <Text style={styles.title}>Painel Reativo</Text>
          <Text style={styles.subtitle}>Micro-interações fluidas por padrão.</Text>
        </View>
      </AnimateEntrance>

      {/* 2. Primary Feature/Hero Component */}
      <AnimateEntrance preset="slideUp" delay={200}>
        <View style={styles.heroCard}>
          <Text style={styles.heroText}>Módulo de Animação Centralizado</Text>
        </View>
      </AnimateEntrance>

      {/* 3. List Segment with Dynamic Entry/Exit tracking */}
      <View style={styles.listSection}>
        {items.map((item, index) => (
          <AnimateEntrance 
            key={item} 
            preset="slideUp" 
            delay={300 + index * 75} // Dynamic stagger orchestration
          >
            <Pressable onPress={() => removeItem(index)} style={styles.listItem}>
              <Text style={styles.itemText}>{item}</Text>
              <Text style={styles.deleteIndicator}>Toque para remover (Exit Test)</Text>
            </Pressable>
          </AnimateEntrance>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Deep slate slate grey background
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  heroText: {
    color: '#38BDF8',
    fontWeight: '600',
    fontSize: 16,
  },
  listSection: {
    gap: 12,
  },
  listItem: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteIndicator: {
    color: '#F43F5E',
    fontSize: 11,
  },
});

```

---

## 7. Performance & Optimization Commandments

As an AI Agent, when you generate or evaluate React Native UI code, check it against these rules to guarantee fluid execution:

1. **Worklet Serialization Avoidance:** Do not access variables inside `useAnimatedStyle` or worklets that are declared outside the hook unless they are React Native Reanimated `SharedValues`. If you do, it triggers a JavaScript-to-UI thread serialization penalty.
2. **No Direct Flex State Toggle Animations:** Never animate elements using direct Layout updates from state change triggers (`width: useState()`). Instead, render components natively and transform their dimensions via scale or translate parameters on the `useAnimatedStyle` hooks, or use `Layout.springify()` macro tags.
3. **Render Culling:** Use virtualization lists (`FlashList` from Shopify or `Animated.FlatList`) for large datasets. Apply entry animation modifiers exclusively to elements currently hitting the initial view window bounds (`windowSize` parameters).
4. **Pointer Events Control:** During execution phases of complex screen unmounting (`exiting`), explicitly enforce `pointerEvents="none"` on the unmounting containers to avoid phantom touch registers.

---

## 8. Agent Execution Prompts

*When asked to build any new view, feature, component, or layout wrapper, you MUST automatically structure the generated artifact utilizing the template definitions contained within this file. Always wrap elements in calculated sequential entrance sequences (`AnimateEntrance`) to satisfy the universal orchestration constraint.*
"""

filename = "react_native_ts_animation_skill.txt"

with open(filename, "w", encoding="utf-8") as f:
f.write(content)

print(f"File {filename} created successfully.")

```
O seu arquivo de texto contendo a skill customizada para IA agentica já está pronto para download. Ele foi estruturado de forma técnica e objetiva, ideal para ser consumido como um documento de contexto ou instrução (`System Prompt` / `Knowledge Base`) por um agente de IA.

O documento detalha a arquitetura ideal de pastas, padrões técnicos rigorosos com TypeScript, o uso avançado da biblioteca `react-native-reanimated` para garantir execução na Thread de UI a 60/120 FPS, e fornece um wrapper utilitário declarativo (`AnimateEntrance`) projetado especificamente para orquestrar animações de entrada e saída em **todos os componentes de todas as páginas** de forma automatizada e limpa.

### Seu arquivo pronto
[file-tag: code-generated-file-0-1780537653092858401]

---

### Resumo dos Princípios Inclusos no Arquivo:

1. **Abstração por Wrapper Declarativo (`AnimateEntrance`):** Para evitar retrabalho e código poluído (boilerplate) em todas as telas, a skill instrui a IA a encapsular os elementos em componentes estruturais que utilizam os métodos nativos `entering` e `exiting` do *Reanimated v3*.
2. **Orquestração e Staggering:** O arquivo ensina o agente de IA a calcular dinamicamente os atrasos (`delay`) com base no index ou posição do componente, garantindo que os elementos entrem de forma sequencial e fluida na tela, em vez de aparecerem todos ao mesmo tempo.
3. **Animações na Thread de UI:** Foco absoluto no uso de *Worklets* e valores compartilhados (`SharedValues`), mitigando gargalos de comunicação entre a thread do JavaScript e a thread Nativa do dispositivo.
4. **Layout Transitions Prontas:** Inclusão do modificador `layout={CurvedTransition}` para garantir que, quando um componente sofrer animação de saída, os elementos irmãos se reposicionem de forma suave e automática, sem saltos secos de layout.

