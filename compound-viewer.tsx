import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { ReactionCard } from "./reaction-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import type { Compound, Reaction } from "@shared/schema";

interface CompoundViewerProps {
  compound: Compound;
  onClose: () => void;
  open: boolean;
}

export function CompoundViewer({ compound, onClose, open }: CompoundViewerProps) {
  const { data: relatedReactions, isLoading } = useQuery<{
    asReactant: Reaction[];
    asProduct: Reaction[];
  }>({
    queryKey: ["/api/compounds", compound.id, "reactions"],
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogTitle>{compound.name}</DialogTitle>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="font-semibold">Formula</dt>
                    <dd>{compound.formula}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Molecular Weight</dt>
                    <dd>{compound.molecularWeight}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Description</dt>
                    <dd>{compound.description}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="asReactant">
            <TabsList>
              <TabsTrigger value="asReactant">As Reactant</TabsTrigger>
              <TabsTrigger value="asProduct">As Product</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <TabsContent value="asReactant">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedReactions?.asReactant.map((reaction) => (
                      <ReactionCard key={reaction.id} reaction={reaction} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="asProduct">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedReactions?.asProduct.map((reaction) => (
                      <ReactionCard key={reaction.id} reaction={reaction} />
                    ))}
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
