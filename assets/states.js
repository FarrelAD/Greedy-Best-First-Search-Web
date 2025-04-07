document.addEventListener('alpine:init', () => {
    Alpine.store('nodes', {
        nodes: [],
        updateNode(totalNode) {
            if (totalNode <= this.nodes.length) {
                return this.nodes.length = totalNode;
            }

            const fxChoices = [200, 250, 300, 350, 400, 450, 500];
            const fyChoices = [100, 130, 160, 190, 220, 250, 280];
            
            do {
                const fx = fxChoices[Math.floor(Math.random() * fxChoices.length)];
                const fy = fyChoices[Math.floor(Math.random() * fyChoices.length)]
                this.nodes.push({ name: '', fx: fx, fy: fy })
            } while (this.nodes.length < totalNode);
        },
        updateNodeProperty(index, name) {
            this.nodes[index].name = name;
        }
    });

    Alpine.store('paths', {
        paths: [],
        addPath(id, path) {
            const index = this.paths.findIndex(path => path.id === id);

            if (index === -1) {
                return this.paths.push({ 
                    id: id,
                    path: path
                });
            }

            this.paths[index].path = path;
        }
    });
});