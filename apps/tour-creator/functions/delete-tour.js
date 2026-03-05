export async function onRequestPost(context) {
    try {
        const jwt = require('jsonwebtoken');
        const authHeader = context.request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { 
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, context.env.JWT_SECRET);

        const db = context.env.DATABASE;
        const bucket = context.env.BUCKET;
        const { tourId } = await context.request.json();

        // Only superadmins or the admin who owns the tour can delete
        let tourData;
        if (decoded.isSuperAdmin) {
            const result = await db.prepare("SELECT tour FROM tours WHERE tour_ID = ?")
                .bind(tourId)
                .first();
            tourData = result?.tour;
        } else {
            const result = await db.prepare("SELECT tour FROM tours WHERE tour_ID = ? AND admin_ID = ?")
                .bind(tourId, decoded.userId)
                .first();
            tourData = result?.tour;
        }

        // Find and delete all associated images from R2
        if (tourData) {
            try {
                const tour = JSON.parse(tourData);
                const imageFilenames = new Set();

                const extractFilename = (url) => {
                    if (!url || typeof url !== 'string') return null;
                    const match = url.match(/name=([^&]+)/);
                    return match ? match[1] : null;
                };

                // Main page logo
                if (tour.tour?.mainPage?.logo) {
                    const filename = extractFilename(tour.tour.mainPage.logo);
                    if (filename) imageFilenames.add(filename);
                }

                // Slideshow images
                if (tour.tour?.mainPage?.slideShowImages) {
                    tour.tour.mainPage.slideShowImages.forEach(url => {
                        const filename = extractFilename(url);
                        if (filename) imageFilenames.add(filename);
                    });
                }

                // Panorama images + info spot images
                if (tour.tour?.createdPanoNodes) {
                    tour.tour.createdPanoNodes.forEach(node => {
                        const filename = extractFilename(node.imageSrc);
                        if (filename) imageFilenames.add(filename);

                        if (node.infoSpots) {
                            node.infoSpots.forEach(([info]) => {
                                if (info.imageSrc) {
                                    const filename = extractFilename(info.imageSrc);
                                    if (filename) imageFilenames.add(filename);
                                }
                            });
                        }
                    });
                }

                // Delete all images from R2
                for (const filename of imageFilenames) {
                    try {
                        await bucket.delete(filename);
                    } catch (err) {
                        console.error('Failed to delete image:', filename, err);
                    }
                }

            } catch (err) {
                console.error('Failed to parse tour for image cleanup:', err);
            }
        }

        // Delete tour from database
        if (decoded.isSuperAdmin) {
            await db.prepare("DELETE FROM tours WHERE tour_ID = ?")
                .bind(tourId)
                .run();
        } else {
            await db.prepare("DELETE FROM tours WHERE tour_ID = ? AND admin_ID = ?")
                .bind(tourId, decoded.userId)
                .run();
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ message: "Internal server error" }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
