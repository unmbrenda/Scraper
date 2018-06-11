const storyCont = document.getElementById("storyCont");
const modal = document.getElementById('commentModal');
const saveComment = document.getElementById('saveBtn');


window.onclick = event => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


const toggleView = () => {
    storyCont.classList.toggle("scraped-stories");
    storyCont.classList.toggle("saved-stories");
}

const commentHtml = comments => {
    const c = comments.filter(elem => elem.comment);
    const txt = c.map(elem => {
        const s = document.createElement('span');
        s.innerText = elem.comment;
        return s.outerHTML;
    });

    const cb = document.createElement("div");
    cb.classList.add("story-comments");
    cb.innerHTML = txt.join('<br>');
    return cb.outerHTML;
}

const storyHtml = story => {
    const summaryDiv = document.createElement('div');
    summaryDiv.classList.add('story-summary');
    summaryDiv.innerText = story.summary;

    const link = document.createElement('a');
    link.classList.add("headline-link");
    link.setAttribute("href", story.uri);
    link.innerText = story.headline;
    const html = (
        `<div class="story-header">
        <div class="story-headline">
        ${link.outerHTML}
        </div>
        <div class="story-buttons">
        <button class="btn save-story">save</button>
        <button class="btn comment-story">comment</button>
        <button class="btn delete-story">delete</button>
        </div>
        </div>
        ${summaryDiv.outerHTML}
        <div>
        ${(story.comments && story.comments.length > 0) ? commentHtml(story.comments) : ''}
        </div>
        `
    );

    const storyDiv = document.createElement('div');
    storyDiv.classList.add("story");
    storyDiv.innerHTML = html;
    if(story._id){
        storyDiv.setAttribute("data-id", story._id);
    }

    return storyDiv;
}

function scrapeArticles(){
    fetch("/api/scrape")
        .then( resp => {
            return resp.json();
         })
        .then( data => {
            storyCont.innerHTML = "";
            data.forEach(story => {
                const storyDiv = storyHtml(story);
                storyCont.appendChild(storyDiv);
            });

            const classes = storyCont.classList;
            if (classes.contains('saved-stories')){
                storyCont.classList.remove('saved-stories');
            }

            if (!classes.contains('scraped-stories')){
                storyCont.classList.add('scraped-stories');
            }
        })
}


const saveStory = (story, storyDiv) => {
    fetch("/api/article/save", {
        body: JSON.stringify(story),
        headers: {
            "content-type":"application/json"
        },
        method: "POST"
    })
    .then(response => response.json())
    .then(response => {
        if(response.status === 'ok'){
            return storyDiv.parentNode.removeChild(storyDiv);
        }
    })
};

const deleteStory = (id, story) => {
    fetch(`/api/article/delete/${id}`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(response => {
        story.parentNode.removeChild(story);
    })
}

storyCont.addEventListener("click", event => {
    const classes = event.target.classList;
    if (classes.contains('save-story')){
        const storyDiv = event.target
            .parentElement //buttons
            .parentElement //headline
            .parentElement; //story

        const headlineLink = storyDiv.querySelector("a")
        const headline = headlineLink.innerText;
        const uri = headlineLink.getAttribute("href");
        const summary = storyDiv.querySelector(".story-summary").innerText;

        const story = {
            headline,
            uri,
            summary
        };

        return saveStory(story, storyDiv);
    }

    const target = event.target;
    const story = target.parentElement.parentElement.parentElement;
    const id = story.getAttribute("data-id");

    if (classes.contains('delete-story')){
        deleteStory(id, story);
    }

    if (classes.contains('comment-story')){
        const storyHl = story.querySelector("a").innerText;
        const storyId = story.getAttribute("data-id");
        const modalHl  = modal.querySelector(".modal-headline");
        modalHl.innerText = storyHl;
        modalHl.setAttribute("data-id", storyId);

        modal.style.display = "block";
    }
});

const showSaved = () => {
    fetch("/api/saved")
        .then( resp => {
            return resp.json();
         })
        .then( data => {
            storyCont.innerHTML = "";
            data.forEach(story => {
                const storyDiv = storyHtml(story);
                storyCont.appendChild(storyDiv);
            });

            const classes = storyCont.classList;
            if (!classes.contains('saved-stories')){
                storyCont.classList.add('saved-stories');
            }

            if (classes.contains('scraped-stories')){
                storyCont.classList.remove('scraped-stories');
            }
        })
}

document.getElementById("scrape").addEventListener("click", event => {
    scrapeArticles();
})

document.getElementById("viewSaved").addEventListener("click", event => {
    showSaved();
})

saveComment.addEventListener("click", event => {
    event.preventDefault();

    const articleId = modal.querySelector(".modal-headline").getAttribute("data-id");
    const comment = modal.querySelector("#newComment").value;

    const payload = {
        articleId,
        comment,
    };

    fetch("/api/comment/add", {
        body: JSON.stringify(payload),
        headers: {
            "content-type":"application/json"
        },
        method: "POST"
    })
    .then(response => response.json())
    .then(response => {
        if(response.status === 'ok'){
            modal.querySelector("form").reset();

            fetch(`/api/article/${articleId}`)
                .then(resp => resp.json())
                .then(resp => {
                    const oart = storyCont.querySelector(`.story[data-id="${articleId}"]`);
                    const nart = storyHtml(resp);
                    oart.parentNode.insertBefore(nart, oart);
                    oart.parentNode.removeChild(oart);
                })

            modal.style.display = "none";
        }
    })

})

scrapeArticles();