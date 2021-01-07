WebSocket = class { }; // Disable Live Reload

window.addEventListener("load", () => {
    let update_interval = setInterval(update, 1500);
    update();

    document.getElementById("stop-update").addEventListener("click", function () {
        clearInterval(update_interval);
        this.remove();
    });
});

async function update() {
    let new_page = await fetch("data.html");
    if (!new_page.ok) {
        console.warn("Failed to fetch the latest graph")
        return;
    }
    let page_content = await new_page.text();

    let incoming_graph_body = document.createElement("body");
    incoming_graph_body.innerHTML = page_content;

    let existing_graph_body = document.getElementById("graph");

    let incoming_divs = Array.from(incoming_graph_body.getElementsByTagName("div"));
    let existing_divs = Array.from(existing_graph_body.getElementsByTagName("div"));

    for (let [incoming, existing] of zip_full(incoming_divs, existing_divs)) {
        if (incoming == undefined) {
            console.log("Removing", existing);

            existing.remove()
        } else if (existing == undefined) {
            console.log("Appending", incoming);

            existing_graph_body.appendChild(incoming);
        } else {
            if (!compareMaps(existing.attributes, incoming.attributes)) {
                console.log("Updating", existing, "to", incoming);

                for (let i = 0; i < incoming.attributes.length; i++) {
                    let { name, value } = incoming.attributes.item(i);
                    existing.setAttribute(name, value);
                }
            }
        }
    }

    incoming_graph_body.remove();
}

/**
 * Combine 2 arrays together to an array of tuples fully
 * 
 * @param {T[]} a 
 * @param {Q[]} b 
 * @returns {[T?, Q?][]}
 * @template T,Q
 */
function zip_full(a, b) {
    return Array.from(Array(Math.max(b.length, a.length)), (_, i) => [a[i], b[i]]);
}

/**
 * Combine 2 arrays together to an array of tuples until one of the
 * arrays runs out of elements
 * 
 * @param {T[]} a 
 * @param {Q[]} b 
 * @returns {[T, Q][]}
 * @template T,Q
 */
function zip_short(a, b) {
    return a.map((k, i) => [k, b[i]]);
}

/**
 * Compare 2 `NamedNodeMap`s
 * 
 * @param {NamedNodeMap} map1 
 * @param {NamedNodeMap} map2 
 */
function compareMaps(map1, map2) {
    if (map1.length !== map2.length) {
        return false;
    }
    for (let i = 0; i < map1.length; i++) {
        let { name, value } = map1.item(i);

        let attr = map2.getNamedItem(name);

        if (attr === null || attr.value !== value) {
            return false;
        }
    }
    return true;
}