'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BackgroundGradientProps } from '@/shared/types';

// Interface para a instância do ThpaceGL
interface ExtendedThpaceGL {
  destroy?: () => void;
  updateSettings?: (settings: any) => void;
}

/**
 * Componente que renderiza um gradiente animado no fundo da aplicação
 * Requer a biblioteca ThpaceGL para ser inicializada no cliente
 */
export const BackgroundGradient = ({
  children,
  themeName = 'dark',
  config,
}: BackgroundGradientProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thpaceInstanceRef = useRef<ExtendedThpaceGL | null>(null);
  const isInitializingRef = useRef(false);
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });

  // Define dimensões do canvas no cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateSize = () => {
        setCanvasSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  // Inicializa o Thpace
  useEffect(() => {
    // Se estamos no servidor, não fazemos nada
    if (typeof window === 'undefined') {
      return;
    }

    // Previne múltiplas inicializações simultâneas
    if (isInitializingRef.current) {
      return;
    }

    // Dinamicamente importa a biblioteca ThpaceGL apenas no cliente
    const initThpace = async () => {
      // Verifica se o canvas existe
      const canvas = canvasRef.current;
      if (!canvas) {
        console.warn('[Thpace] Canvas não encontrado');
        return;
      }

      // Verifica se já está inicializando
      if (isInitializingRef.current) {
        return;
      }

      isInitializingRef.current = true;

      try {
        // Importa o ThpaceGL dinamicamente
        const thpaceModule = await import('thpace');
        const ThpaceGL = thpaceModule.ThpaceGL;

        if (!ThpaceGL) {
          console.error('[Thpace] ThpaceGL não encontrado no módulo', thpaceModule);
          isInitializingRef.current = false;
          return;
        }

        // Verifica novamente se o canvas existe
        if (!canvas) {
          console.warn('[Thpace] Canvas não encontrado após import');
          isInitializingRef.current = false;
          return;
        }

        // Define dimensões do canvas
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        // Verifica suporte WebGL
        const webglSupport = ThpaceGL.webglSupport?.();
        if (!webglSupport) {
          console.warn('[Thpace] WebGL não suportado neste navegador');
          isInitializingRef.current = false;
          return;
        }

        // Destroi instância anterior, se houver
        if (thpaceInstanceRef.current) {
          // Tenta destruir se tiver método destroy
          if (typeof (thpaceInstanceRef.current as any).destroy === 'function') {
            (thpaceInstanceRef.current as any).destroy();
          }
          thpaceInstanceRef.current = null;
        }

        const isDark = themeName === 'dark';
        
        // Cores mais claras para tema dark - tons de azul/prata mais visíveis
        const darkColors = [
          '#1e293b',  // slate-800 - mais claro que #111827
          '#334155',  // slate-700
          '#475569',  // slate-600
          '#64748b',  // slate-500
        ];
        
        const lightColors = [
          '#cbd5e1',  // slate-300
          '#94a3b8',  // slate-400
          '#64748b',  // slate-500
          '#475569',  // slate-600
        ];
        
        // Garante que colors é um array válido
        const colors = config?.colors && Array.isArray(config.colors) && config.colors.length > 0
          ? config.colors
          : (isDark ? darkColors : lightColors);
        
        // Garante que particleSettings é um objeto válido
        const particleSettings = config?.particleSettings && typeof config.particleSettings === 'object'
          ? config.particleSettings
          : { count: 0 };
        
        // Cria a instância do ThpaceGL
        const instance = ThpaceGL.create(canvas, {
          triangleSize: config?.triangleSize || 130,
          bleed: config?.bleed || 120,
          noise: config?.noise || 60,
          animationOffset: config?.animationOffset || 250,
          pointVariationX: config?.pointVariationX || 20,
          pointVariationY: config?.pointVariationY || 35,
          pointAnimationSpeed: config?.pointAnimationSpeed || 7500,
          maxFps: config?.maxFps || 144,
          automaticResize: true,
          colors: colors,
          particleSettings: particleSettings,
        });

        if (instance) {
          thpaceInstanceRef.current = instance as ExtendedThpaceGL;
          console.log('[Thpace] ✅ Inicializado com sucesso');
        } else {
          console.error('[Thpace] ❌ Falha ao criar instância');
        }
      } catch (error) {
        console.error('[Thpace] ❌ Erro ao inicializar:', error);
      } finally {
        isInitializingRef.current = false;
      }
    };

    // Usa requestAnimationFrame para garantir que o DOM está pronto
    const frameId = requestAnimationFrame(() => {
      // Pequeno delay para garantir que o canvas está renderizado
      setTimeout(() => {
        initThpace();
      }, 100);
    });

    return () => {
      cancelAnimationFrame(frameId);
      isInitializingRef.current = false;
      
      if (thpaceInstanceRef.current) {
        // Tenta destruir se tiver método destroy
        if (typeof (thpaceInstanceRef.current as any).destroy === 'function') {
          (thpaceInstanceRef.current as any).destroy();
        }
        thpaceInstanceRef.current = null;
      }
    };
  }, [themeName, config, canvasSize]);

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          opacity: 1, // Opacidade máxima para ficar mais claro
          pointerEvents: 'none',
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
    </div>
  );
};
