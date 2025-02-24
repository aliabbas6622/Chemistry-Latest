import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoleculeViewer } from "./molecule-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useReactionSounds } from "@/lib/useReactionSounds";
import { 
  BookmarkIcon, 
  ArrowRightIcon,
  BeakerIcon,
  ClipboardIcon 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Reaction } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ReactionCardProps {
  reaction: Reaction;
}

export function ReactionCard({ reaction }: ReactionCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { playReactionSound } = useReactionSounds();

  const handleReactionClick = () => {
    setIsAnimating(true);
    playReactionSound(reaction.category);
    setShowDetails(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiRequest("POST", `/api/reactions/${reaction.id}/bookmark`);
      queryClient.invalidateQueries({ queryKey: ["/api/reactions"] });
      toast({
        title: reaction.isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive"
      });
    }
  };

  const [reactants, products] = reaction.molecularFormula.split('->').map(s => 
    s.trim().split('+').map(compound => compound.trim())
  );

  return (
    <>
      <motion.div
        className="perspective-1000 cursor-pointer relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleReactionClick}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
      >
        {/* Visual flourish animation */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 2], rotate: [0, 180] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="w-full h-full bg-primary/20 rounded-lg" />
            </motion.div>
          )}
        </AnimatePresence>

        <Card 
          className={`w-full h-full ${isFlipped ? "rotate-y-180" : ""} transition-transform duration-300`}
        >
          <CardHeader className="flex flex-row justify-between items-start">
            <CardTitle className="text-lg font-bold">{reaction.name}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleBookmark}
              className="hover:bg-transparent"
            >
              <BookmarkIcon 
                className={`transition-colors ${reaction.isBookmarked ? "fill-primary" : ""}`}
              />
            </Button>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>{reaction.functionalGroup}</Badge>
                <Badge variant="secondary">{reaction.category}</Badge>
              </div>

              <Tabs defaultValue="view3d" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="view3d">3D View</TabsTrigger>
                  <TabsTrigger value="mechanism">Mechanism</TabsTrigger>
                </TabsList>

                <TabsContent value="view3d">
                  <div className="h-48 transition-transform hover:scale-[1.01] duration-200">
                    <MoleculeViewer formula={reaction.molecularFormula} />
                  </div>
                </TabsContent>

                <TabsContent value="mechanism">
                  <div className="h-48 overflow-y-auto prose prose-sm">
                    <p>{reaction.mechanism}</p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 transition-transform hover:translate-x-1 duration-200">
                  <BeakerIcon className="h-4 w-4" />
                  <span>Conditions: {reaction.conditions}</span>
                </div>
                <div className="flex items-center gap-2 transition-transform hover:translate-x-1 duration-200">
                  <ArrowRightIcon className="h-4 w-4" />
                  <span>Products: {reaction.products}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{reaction.name}</DialogTitle>
          </DialogHeader>

          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Reactants</h3>
                <ul className="space-y-2">
                  {reactants.map((compound, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <BeakerIcon className="h-4 w-4" />
                      {compound}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Products</h3>
                <ul className="space-y-2">
                  {products.map((compound, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <BeakerIcon className="h-4 w-4" />
                      {compound}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-2">Reaction Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Conditions</h4>
                  <p>{reaction.conditions}</p>
                </div>
                <div>
                  <h4 className="font-medium">Mechanism</h4>
                  <p className="whitespace-pre-line">{reaction.mechanism}</p>
                </div>
                <div>
                  <h4 className="font-medium">Real World Applications</h4>
                  <p>{reaction.realWorldApplications}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}