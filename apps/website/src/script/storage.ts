import { TourNode, PanoNode, InfoPointNode, MainPageNode } from "./TourDataStruct";

export type Project = { id: string; name: string; admin: string; tour: TourNode };

export const getProject = async (tourId: string): Promise<Project | null> => {
    try {

        // NOTE: This api doesnt exist rn
        const response = await fetch(`/get-tour?tourId=${tourId}`);
        const data = await response.json();

        if (!data.tours || data.tours.length === 0) return null;

        const item = data.tours[0];
        const p = item.tourData;

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
            id: item.tourId.toString(),
            name: p.name,
            admin: p.admin,
            tour
        };
    } catch (e) {
        console.error("Failed to load project", e);
        return null;
    }
};
