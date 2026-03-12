import { TourNode, PanoNode, InfoPointNode, MainPageNode } from "./TourDataStruct";

export type Project = { id: string; name: string; admin: string; tour: TourNode };

export const getPublishedTour = async (tourId: string): Promise<Project | null> => {
    try {
        const response = await fetch(`/get-published?id=${tourId}`);
        if (!response.ok) return null;

        const p = await response.json();
        if (!p) return null;

        // Re-create the TourNode
        const tour = new TourNode(p.name, p.admin);
        Object.assign(tour, p.tour);

        // Re-create MainPageNode
        if (p.tour.mainPage) {
            const title = p.tour.mainPage.title || p.name || "Untitled";
            tour.mainPage = new MainPageNode(title);
            Object.assign(tour.mainPage, p.tour.mainPage);
        }

        // Re-create all PanoNodes
        const panoMap = new Map<string, PanoNode>();

        if (tour.createdPanoNodes) {
            tour.createdPanoNodes = tour.createdPanoNodes.map((panoData: any) => {
                const pano = new PanoNode(panoData.imageSrc);
                Object.assign(pano, panoData);

                if (pano.infoSpots) {
                    pano.infoSpots = pano.infoSpots.map(([infoData, yaw, pitch]: any) => {
                        const info = new InfoPointNode(infoData.title, infoData.description);
                        Object.assign(info, infoData);
                        return [info, yaw, pitch];
                    });
                }

                panoMap.set(pano.imageSrc, pano);
                return pano;
            });
        }

        // Re-link Node Connections
        if (tour.createdPanoNodes) {
            tour.createdPanoNodes.forEach(pano => {
                if (pano.nodeConnection) {
                    pano.nodeConnection = pano.nodeConnection.map(([targetSrc, yaw, pitch]: any) => {
                        const targetNode = panoMap.get(targetSrc);
                        if (targetNode) {
                            return [targetNode, yaw, pitch];
                        }
                        return null;
                    }).filter((conn): conn is [PanoNode, number, number] => conn !== null);
                }
            });
        }

        // Restore startNode reference
        if (tour.startNode) {
            const startNodeRef = panoMap.get((tour.startNode as any).imageSrc);
            if (startNodeRef) {
                tour.startNode = startNodeRef;
            } else {
                const looseStartNode = new PanoNode((tour.startNode as any).imageSrc);
                Object.assign(looseStartNode, tour.startNode);
                tour.startNode = looseStartNode;
            }
        }

        return {
            id: tourId,
            name: p.name,
            admin: p.admin,
            tour
        };
    } catch (e) {
        console.error("Failed to load published tour", e);
        return null;
    }
};

export type PublishedTourSummary = { id: number; title: string; description: string; logo: string };

export const getAllPublishedTours = async (): Promise<PublishedTourSummary[]> => {
    try {
        const response = await fetch("/get-all-published");
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.error("Failed to load published tours", e);
        return [];
    }
};
