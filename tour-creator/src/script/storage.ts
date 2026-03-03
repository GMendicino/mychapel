import { TourNode, PanoNode, InfoPointNode, MainPageNode } from "./TourDataStruct";

export type Project = { id: string; name: string; admin: string, tour: TourNode };
export type Admin = { id: string; name: string; password: string };

// Helper to get token
const getAuthToken = () => localStorage.getItem("authToken");

// MAKE THIS ASYNC
export const listProjects = async (): Promise<Project[]> => {
    try {
        const token = getAuthToken();
        if (!token) return [];

        const response = await fetch("/get-tour", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();
        if (!data.tours) return [];


        return data.tours.map((item: any) => {
            const p = item.tourData; // From database
            
            if (!p) {
                const fallback = new TourNode("Untitled", "Unknown");
                return { id: item.tourId.toString(), name: "Untitled", admin: "Unknown", tour: fallback };
            }


            // 1. Re-create the TourNode
            const tour = new TourNode(p.name, p.admin);
            Object.assign(tour, p.tour);

            // Re-create MainPageNode
            if (p.tour.mainPage) {
                const title = p.tour.mainPage.title || p.name || "Untitled";
                tour.mainPage = new MainPageNode(title);
                Object.assign(tour.mainPage, p.tour.mainPage);
            }

            // 2. Re-create all PanoNodes
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

            // 3. Re-link Node Connections
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

            // 4. Restore startNode reference
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
        });
    } catch (e) {
        console.error("Failed to load projects", e);
        return [];
    }
};

export const saveProjects = async (arr: Project[], assignedAdminId?: string): Promise<void> => {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const replacer = (key: string, value: any) => {
        if (key === "nodeConnection" && Array.isArray(value)) {
            return value.map(([node, yaw, pitch]: any) => {
                if (node && typeof node === 'object' && 'imageSrc' in node) {
                    return [node.imageSrc, yaw, pitch];
                }
                return [node, yaw, pitch];
            });
        }
        return value;
    };

    for (const project of arr) {
        const response = await fetch("/save-tour", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                tourId: project.id,
                adminId: assignedAdminId,  // Send the admin ID
                tourData: JSON.parse(JSON.stringify(project, replacer))
            })
        });
        
        const data = await response.json();
        if (data.tourId && project.id === "new") {
            project.id = data.tourId.toString();
        }
    }
};

export const deleteImage = async (imageUrl: string, tourId: string): Promise<boolean> => {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch("/delete-image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl, tourId })
    });

    const data = await response.json();
    return data.success;
};

export const deleteTour = async (tourId: string): Promise<boolean> => {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch("/delete-tour", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tourId })
    });

    const data = await response.json();
    return data.success;
};

export const listAdmins = async (): Promise<Admin[]> => {
    try {
        const token = getAuthToken();
        if (!token) return [];

        const response = await fetch("/get-admins", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();
        if (!data.admins) return [];

        return data.admins.map((admin: any) => ({
            id: admin.admin_ID.toString(),
            name: admin.username,
            password: "" 
        }));
    } catch (e) {
        console.error("Failed to load admins", e);
        return [];
    }
};

export const deleteAdmin = async (adminId: string): Promise<{ success: boolean; message?: string }> => {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch("/delete-admin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ adminId })
    });

    const data = await response.json();
    return { success: !!data.success, message: data.message };
};

export const reassignTour = async (newAdminId: string, tourId: string): Promise<boolean> => {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch("/reassign-tour", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tourId, newAdminId })
    });

    const data = await response.json();
    return data.success;
};

