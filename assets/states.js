document.addEventListener('alpine:init', () => {
    Alpine.store('nodes', {
        nodesData: [],
        startNode: null,
        endNode: null,
        updateNode(totalNode) {
            if (totalNode <= this.nodesData.length) {
                return this.nodesData.length = totalNode;
            }

            const fxChoices = [200, 250, 300, 350, 400, 450, 500];
            const fyChoices = [100, 130, 160, 190, 220, 250, 280];
            
            do {
                const fx = fxChoices[Math.floor(Math.random() * fxChoices.length)];
                const fy = fyChoices[Math.floor(Math.random() * fyChoices.length)]
                this.nodesData.push({ name: '', fx: fx, fy: fy, h: 0 })
            } while (this.nodesData.length < totalNode);
        },
        updateNodeProperty(index, name) {
            this.nodesData[index].name = name;
        }
    });

    Alpine.store('links', {
        linksData: [],
        addLink(source, target) {
            this.linksData.push({ source: source, target: target});
        }
    });
});