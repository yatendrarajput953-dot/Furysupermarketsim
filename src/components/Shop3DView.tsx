import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';
import * as THREE from 'three';
import { GameState } from '../types';
import { PRODUCTS } from '../hooks/constants';

function Customer({ 
  startPosition, 
  color, 
  shelves, 
  checkoutPosition 
}: { 
  startPosition: [number, number, number], 
  color: string,
  shelves: { position: [number, number, number], price: number, baseCost: number }[],
  checkoutPosition: [number, number, number]
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [satisfaction, setSatisfaction] = useState(100);
  const [hasItem, setHasItem] = useState(false);
  
  // State machine: 0 = entering/browsing, 1 = at shelf, 2 = going to checkout, 3 = at checkout, 4 = leaving
  const stateRef = useRef({
    phase: 0,
    target: [0, 0, 0] as [number, number, number],
    waitTime: 0,
    speed: 1 + Math.random() * 1.5,
    targetShelf: null as any,
    satisfaction: 100,
    hasItem: false
  });

  // Initialize target
  useEffect(() => {
    if (shelves.length > 0) {
      const randomShelf = shelves[Math.floor(Math.random() * shelves.length)];
      stateRef.current.targetShelf = randomShelf;
      stateRef.current.target = [
        randomShelf.position[0] + (Math.random() - 0.5) * 2,
        0.7,
        randomShelf.position[2] + 1.5
      ];
    } else {
      stateRef.current.target = [checkoutPosition[0], 0.7, checkoutPosition[2] - 2];
    }
  }, [shelves, checkoutPosition]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    const s = stateRef.current;
    
    if (s.phase === 0 || s.phase === 2 || s.phase === 4) {
      // Move towards target
      const dx = s.target[0] - ref.current.position.x;
      const dz = s.target[2] - ref.current.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist < 0.1) {
        // Reached target
        if (s.phase === 0) {
          s.phase = 1; // wait at shelf
          s.waitTime = 1 + Math.random() * 3;
          if (s.targetShelf) {
            const markup = s.targetShelf.price / s.targetShelf.baseCost;
            if (markup < 1.2) s.satisfaction = Math.min(100, s.satisfaction + 10);
            else if (markup > 2) s.satisfaction = Math.max(0, s.satisfaction - 20);
            else s.satisfaction = Math.min(100, s.satisfaction + 5);
            setSatisfaction(s.satisfaction);

            // Decide to buy
            const buyChance = (s.satisfaction / 100) * (markup > 2 ? 0.2 : markup < 1.2 ? 0.9 : 0.5);
            if (Math.random() < buyChance) {
              s.hasItem = true;
              setHasItem(true);
            }
          }
        } else if (s.phase === 2) {
          s.phase = 3; // wait at checkout
          s.waitTime = 1 + Math.random() * 2;
        } else if (s.phase === 4) {
          // Reset to browse again
          s.phase = 0;
          s.hasItem = false;
          setHasItem(false);
          s.satisfaction = 100;
          setSatisfaction(100);
          if (shelves.length > 0) {
            const randomShelf = shelves[Math.floor(Math.random() * shelves.length)];
            s.targetShelf = randomShelf;
            s.target = [
              randomShelf.position[0] + (Math.random() - 0.5) * 2,
              0.7,
              randomShelf.position[2] + 1.5
            ];
          } else {
            s.target = [checkoutPosition[0], 0.7, checkoutPosition[2] - 2];
          }
        }
      } else {
        // Move
        ref.current.position.x += (dx / dist) * s.speed * delta;
        ref.current.position.z += (dz / dist) * s.speed * delta;
      }
    } else if (s.phase === 1 || s.phase === 3) {
      // Waiting
      s.waitTime -= delta;
      
      if (s.phase === 3) {
        s.satisfaction = Math.max(0, s.satisfaction - delta * 5); // lose satisfaction faster at checkout
      } else {
        s.satisfaction = Math.max(0, s.satisfaction - delta * 2);
      }
      setSatisfaction(Math.floor(s.satisfaction));

      if (s.waitTime <= 0) {
        if (s.phase === 1) {
          if (s.hasItem) {
            s.phase = 2; // go to checkout
            s.target = [
              checkoutPosition[0] + (Math.random() - 0.5) * 2,
              0.7,
              checkoutPosition[2] - 1.5
            ];
          } else if (s.satisfaction < 30) {
            // Leave angry
            s.phase = 4;
            s.target = [
              (Math.random() - 0.5) * 4,
              0.7,
              checkoutPosition[2] + 5 // out the door
            ];
          } else {
            // Browse another shelf
            s.phase = 0;
            if (shelves.length > 0) {
              const randomShelf = shelves[Math.floor(Math.random() * shelves.length)];
              s.targetShelf = randomShelf;
              s.target = [
                randomShelf.position[0] + (Math.random() - 0.5) * 2,
                0.7,
                randomShelf.position[2] + 1.5
              ];
            } else {
              s.target = [checkoutPosition[0], 0.7, checkoutPosition[2] - 2];
            }
          }
        } else if (s.phase === 3) {
          s.phase = 4; // leave
          s.hasItem = false;
          setHasItem(false);
          s.target = [
            (Math.random() - 0.5) * 4,
            0.7,
            checkoutPosition[2] + 5 // out the door
          ];
        }
      }
    }
  });

  return (
    <mesh ref={ref} position={startPosition} castShadow>
      <capsuleGeometry args={[0.4, 1, 4, 8]} />
      <meshStandardMaterial color={color} />
      {hasItem && (
        <Box args={[0.3, 0.3, 0.3]} position={[0.3, 0, 0.3]} castShadow>
          <meshStandardMaterial color="#4ade80" />
        </Box>
      )}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color={satisfaction > 70 ? "#10b981" : satisfaction > 30 ? "#fbbf24" : "#ef4444"}
        anchorX="center"
        anchorY="middle"
      >
        {Math.floor(satisfaction)}%
      </Text>
    </mesh>
  );
}

function Shelf({ 
  position, 
  id,
  name, 
  price, 
  quantity,
  setSellPrice
}: { 
  position: [number, number, number], 
  id: string,
  name: string, 
  price: number, 
  quantity: number,
  setSellPrice: (id: string, price: number) => void
}) {
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: any) => {
    e.stopPropagation();
    const newPrice = prompt(`Set new price for ${name} (Current: $${price.toFixed(2)}):`, price.toString());
    if (newPrice !== null) {
      const parsed = parseFloat(newPrice);
      if (!isNaN(parsed) && parsed > 0) {
        setSellPrice(id, parsed);
      }
    }
  };

  return (
    <group position={position} onClick={handleClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Shelf Base */}
      <Box args={[3, 0.1, 1]} position={[0, 0.05, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={hovered ? "#a0522d" : "#8B4513"} />
      </Box>
      {/* Shelf Levels */}
      <Box args={[3, 0.1, 1]} position={[0, 1, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={hovered ? "#a0522d" : "#8B4513"} />
      </Box>
      <Box args={[3, 0.1, 1]} position={[0, 2, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={hovered ? "#a0522d" : "#8B4513"} />
      </Box>
      {/* Shelf Supports */}
      <Box args={[0.1, 2, 1]} position={[-1.45, 1, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#5c2e0b" />
      </Box>
      <Box args={[0.1, 2, 1]} position={[1.45, 1, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#5c2e0b" />
      </Box>
      
      {/* Items on shelf (visual representation) */}
      {quantity > 0 && (
        <Box args={[2.8, 0.8, 0.8]} position={[0, 0.5, 0]} castShadow>
          <meshStandardMaterial color="#4ade80" />
        </Box>
      )}
      {quantity > 50 && (
        <Box args={[2.8, 0.8, 0.8]} position={[0, 1.5, 0]} castShadow>
          <meshStandardMaterial color="#4ade80" />
        </Box>
      )}

      {/* Labels */}
      <Text
        position={[0, 2.3, 0.51]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      <Text
        position={[0, 2.05, 0.51]}
        fontSize={0.2}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
      >
        ${price.toFixed(2)} ({quantity})
      </Text>
      {hovered && (
        <Text
          position={[0, 2.6, 0.51]}
          fontSize={0.15}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
        >
          Click to set price
        </Text>
      )}
    </group>
  );
}

function ShopEnvironment({ state, setSellPrice }: { state: GameState, setSellPrice: (id: string, price: number) => void }) {
  const shopSize = 10 + (state.shopLevel * 5);
  const isOpen = state.hour >= 8 && state.hour <= 22;
  const checkoutPosition: [number, number, number] = [0, 0, shopSize/2 - 2];
  
  // Generate shelves based on inventory
  const shelves = useMemo(() => {
    const inventoryItems = Object.entries(state.inventory).filter(([_, item]) => item.quantity > 0);
    
    return inventoryItems.map(([productId, item], i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const product = PRODUCTS.find(p => p.id === productId);
      return {
        id: productId,
        name: product?.name || 'Unknown',
        price: item.sellPrice,
        baseCost: product?.baseCost || 1,
        quantity: item.quantity,
        position: [(col - 1) * 4, 0, (row - 1) * 4 - 2] as [number, number, number],
      };
    });
  }, [state.inventory]);
  
  // Generate random customers if open
  const customers = useMemo(() => {
    if (!isOpen) return [];
    const count = Math.floor(Math.random() * 5) + 2 + (state.reputation / 20);
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      position: [(Math.random() - 0.5) * (shopSize - 4), 0.7, checkoutPosition[2] + 2] as [number, number, number],
      color: ['#ef4444', '#3b82f6', '#eab308', '#a855f7', '#ec4899'][Math.floor(Math.random() * 5)]
    }));
  }, [isOpen, state.hour, shopSize, state.reputation, checkoutPosition[2]]);

  return (
    <group>
      {/* Floor */}
      <Box args={[shopSize, 0.1, shopSize]} position={[0, -0.05, 0]} receiveShadow>
        <meshStandardMaterial color="#1f2937" />
      </Box>
      
      {/* Walls */}
      <Box args={[shopSize, 4, 0.2]} position={[0, 2, -shopSize/2]} receiveShadow>
        <meshStandardMaterial color="#374151" />
      </Box>
      <Box args={[shopSize, 4, 0.2]} position={[0, 2, shopSize/2]} receiveShadow>
        <meshStandardMaterial color="#374151" />
      </Box>
      <Box args={[0.2, 4, shopSize]} position={[-shopSize/2, 2, 0]} receiveShadow>
        <meshStandardMaterial color="#374151" />
      </Box>
      <Box args={[0.2, 4, shopSize]} position={[shopSize/2, 2, 0]} receiveShadow>
        <meshStandardMaterial color="#374151" />
      </Box>

      {/* Checkout Counter */}
      <group position={checkoutPosition}>
        <Box args={[4, 1.2, 1]} position={[0, 0.6, 0]} receiveShadow castShadow>
          <meshStandardMaterial color="#4b5563" />
        </Box>
        <Box args={[0.6, 0.4, 0.6]} position={[0, 1.4, 0]} castShadow>
          <meshStandardMaterial color="#9ca3af" />
        </Box>
      </group>

      {/* Shelves */}
      {shelves.map(shelf => (
        <Shelf 
          key={shelf.id} 
          id={shelf.id}
          position={shelf.position} 
          name={shelf.name}
          price={shelf.price}
          quantity={shelf.quantity}
          setSellPrice={setSellPrice}
        />
      ))}

      {/* Customers */}
      {customers.map(c => (
        <Customer 
          key={c.id} 
          startPosition={c.position} 
          color={c.color} 
          shelves={shelves}
          checkoutPosition={checkoutPosition}
        />
      ))}

      {/* Lighting */}
      <ambientLight intensity={isOpen ? 0.5 : 0.1} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={isOpen ? 1 : 0.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      
      {/* Signage */}
      <Text
        position={[0, 3, -shopSize/2 + 0.11]}
        fontSize={1}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
      >
        {state.shopName}
      </Text>
    </group>
  );
}

export default function Shop3DView({ state, setSellPrice }: { state: GameState, setSellPrice: (id: string, price: number) => void }) {
  return (
    <div className="w-full h-[400px] bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 bg-neutral-900/80 backdrop-blur px-3 py-1 rounded-full border border-neutral-700 text-xs text-neutral-300">
        Live 3D View - Click a shelf to set price
      </div>
      <Canvas shadows camera={{ position: [0, 15, 15], fov: 50 }}>
        <OrbitControls 
          enablePan={true}
          enableDamping={true}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.1} 
          minDistance={5} 
          maxDistance={30} 
          makeDefault
        />
        <ShopEnvironment state={state} setSellPrice={setSellPrice} />
      </Canvas>
    </div>
  );
}
