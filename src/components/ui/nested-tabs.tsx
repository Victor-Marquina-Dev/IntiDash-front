"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface NestedSubTab {
  value: string;
  label: string;
  content?: React.ReactNode;
}

export interface NestedTabItem {
  value: string;
  label: string;
  content?: React.ReactNode;
  subTabs?: NestedSubTab[];
}

interface NestedTabsProps {
  items?: NestedTabItem[];
  defaultValue?: string;
  className?: string;
  style?: React.CSSProperties;
  tabsListClassName?: string;
  triggerClassName?: string;
  activeTriggerClassName?: string;
  contentClassName?: string;
  onValueChange?: (value: string) => void;
}

export default function NestedTabs({
  items = [],
  defaultValue,
  className,
  style,
  tabsListClassName,
  triggerClassName,
  activeTriggerClassName,
  contentClassName,
  onValueChange,
}: NestedTabsProps) {
  const [active, setActive] = React.useState(defaultValue ?? items[0]?.value ?? "");
  const [activeSub, setActiveSub] = React.useState<string | null>(null);

  const currentMain = items.find((i) => i.value === active);

  const handleValueChange = (v: string) => {
    setActive(v);
    onValueChange?.(v);
  };

  return (
    <div className={cn("flex flex-col w-full", className)} style={style}>
      <Tabs value={active} onValueChange={handleValueChange} className="w-full">
        {/* Main Tabs */}
        <TabsList
          className={cn("w-full p-0", tabsListClassName)}
          style={{ background: 'var(--tabs-list-bg)', display: 'flex' }}
        >
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={cn(
                "flex-1 transition-colors",
                active === item.value ? activeTriggerClassName : triggerClassName
              )}
              style={{
                color: active === item.value
                  ? 'var(--tabs-trigger-active-color)'
                  : 'var(--tabs-trigger-color)',
                background: active === item.value
                  ? 'var(--tabs-trigger-active-bg)'
                  : 'transparent',
                boxShadow: 'none',
              }}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Sub Tabs */}
        <AnimatePresence mode="wait">
          {currentMain?.subTabs && (
            <motion.div
              key={currentMain.value + "-sub"}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mt-2"
            >
              <Tabs
                value={activeSub || currentMain.subTabs[0]?.value}
                onValueChange={setActiveSub}
              >
                <TabsList className="flex gap-1 bg-background/20 h-auto p-1 rounded-lg">
                  {currentMain.subTabs.map((sub) => (
                    <TabsTrigger
                      key={sub.value}
                      value={sub.value}
                      className="flex-1 px-3 py-1 rounded-md text-xs font-medium"
                    >
                      {sub.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className={cn("mt-2", contentClassName)}>
                  {currentMain.subTabs.map((sub) => (
                    <TabsContent key={sub.value} value={sub.value}>
                      {sub.content}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {items.map((item) =>
            item.value === active && !item.subTabs ? (
              <motion.div
                key={item.value}
                initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className={contentClassName}
              >
                {item.content}
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
