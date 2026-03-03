export class MainPageNode {
    title: string;
    slideShowImages?: string[];
    description?: string;
    logo?: string;
    introduction?: string;
    PointsOfInterest?: [string, string, string][];

    addPointOfInterest(imageSrc: string, title: string, description: string) {
        if (!this.PointsOfInterest) {
            this.PointsOfInterest = [];
        }
        this.PointsOfInterest.push([imageSrc, title, description]);
    }

    constructor(title: string) {
        this.title = title;
    }
}

export class InfoPointNode {
    imageSrc?: string;
    title: string;
    description: string;
    constructor(title: string, description: string) {
        this.title = title;
        this.description = description;
    }
}

export class PanoNode {
    imageSrc: string;
    fileName?: string;
    infoSpots?: [InfoPointNode, number, number][];
    nodeConnection?: [PanoNode, number, number][];

    addInfoSpot(infoPoint: InfoPointNode, yaw: number, pitch: number) {
        if (!this.infoSpots) {
            this.infoSpots = [];
        }
        this.infoSpots.push([infoPoint, yaw, pitch]);
    }

    addNodeConnection(node: PanoNode, yaw: number, pitch: number) {
        if (!this.nodeConnection) {
            this.nodeConnection = [];
        }
        this.nodeConnection.push([node, yaw, pitch]);
    }

    constructor(imageSrc: string, fileName?: string) {
        this.imageSrc = imageSrc;
        this.fileName = fileName;
    }
}

export class TourNode {
    startNode?: PanoNode;
    createdPanoNodes?: PanoNode[];
    mainPage: MainPageNode;
    admin: string;

    constructor(title: string, admin: string) {
        this.mainPage = new MainPageNode(title);
        this.admin = admin;
    }

    setStartNode(imageSrc: string, fileName?: string) {
        if (!this.createdPanoNodes) {
            this.createdPanoNodes = [];
        }
        if (this.startNode && this.createdPanoNodes.includes(this.startNode)) {
            this.createdPanoNodes.splice(this.createdPanoNodes.indexOf(this.startNode), 1);
        }
        this.startNode = new PanoNode(imageSrc, fileName);
        this.createdPanoNodes.push(this.startNode);
    }

    addPanoNode(imageSrc: string, fileName?: string) {
        if (!this.createdPanoNodes) {
            this.createdPanoNodes = [];
        }
        const uploadedPano = new PanoNode(imageSrc, fileName);
        this.createdPanoNodes.push(uploadedPano);
    }
}