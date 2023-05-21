<template>
  <v-app id="inspire">

    <v-app-bar flat>
      <v-container class="fill-height d-flex align-center">
        Hello {{ email }}, 
        The aim of this project being not to test ui, I plead you to enter real values in the form before hitting the submit button. Also there is no loading animation so just be patient and data will be uploaded.

        <v-spacer></v-spacer>


      </v-container>
    </v-app-bar>
    <v-main class="bg-grey-lighten-3">
      <v-container>
        <v-row>
          <v-col cols="8">
            <v-row>
              <v-col v-for="n in articles" :key="n" class="d-flex child-flex" cols="4">
                <v-card class="mx-auto" max-width="344">
                  <v-img src="https://source.unsplash.com/1600x900/?portrait" height="200px" cover></v-img>
                  <v-card-title>
                    {{ n.ArticleTitle }} 
                  </v-card-title>
                  <v-card-subtitle>
                    {{ n.ArticleDate }}
                  </v-card-subtitle>

                  <v-card-actions>
                    <v-btn color="orange-lighten-2" variant="text" @click="show = !show">
                      Read Article Body
                    </v-btn>

                    <v-spacer></v-spacer>

                  </v-card-actions>
                  <v-expand-transition>
                    <div v-show="show">
                      <v-divider></v-divider>

                      <v-card-text>
                        
                        {{ n.ArticleBody }} 

                        <p>The different tags associated to this article are : Default {{n.ArticleTags}}</p>
                      </v-card-text>
                    </div>
                  </v-expand-transition>
                </v-card>
              </v-col>

            </v-row>
          </v-col>
          <v-col cols="4">
            <form>

              <h1>Add an article here</h1>
              <v-text-field v-model="title" label="Title"></v-text-field>

              <v-textarea v-model="body" label="Text Body"></v-textarea>

              <v-select v-model="tags" :items="items" chips label="Tags" multiple></v-select>

              <v-btn class="me-4 mb-8" @click="postArticle">
                submit
              </v-btn>

              <p>Link to the AWS Bucket: <a
                  href="https://s3.console.aws.amazon.com/s3/buckets/tekriture?region=us-east-1&tab=objects">Visit The
                  different files files you uploaded here</a></p>
              <p>Link of the github repo <a
                  href="https://github.com/Jael-dev/sca-emerald">Access the different folders here. The client and the server</a> </p>

            </form>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    show: false,
    url: "",
    title: "",
    body: "",
    tags: "",
    mail: "",
    image: null,
    items: ['slam', 'melancoly', 'charm', 'beauty'],
    value: ['slam', 'melancoly', 'charm', 'beauty'],
    articles: {},
    links: [
      'Acceuil',
      'Blog',
      'Catégories',
      'Contacter',
    ],
    social: [
      'Acceuil',
      'Blog',
      'Catégories',
      'Contacter',
    ],
  }),
  created() {
    this.getArticleList();
    this.getUser();
  },
  methods: {
    async getArticleList() {
      await this.axios.get("http://localhost:3000/articles").then((response) => {
        this.articles = response.data
      })
    },
    async getUrl() {
      this.url = "https://source.unsplash.com/1600x900/?portrait"
      console.log(this.url)
      return this.url
    },
    async getUser() {
      await this.axios.get("http://localhost:3000/user").then((response) => {
        this.mail = response.data
      })
    },
    async postArticle() {
      var id = this.articles.length + 2
      console.log("Posting article")
      await this.axios.post("http://localhost:3000/articles", {
        ArticleId: id,
        ArticleTitle: this.title,
        ArticleBody: this.body,
        ArticleImage: "image",
        ArticleDate: String(Date()),
        AticleAudio: "",
        ArticleTags: this.tags,
        CategoryId: 1
      }).then((response) => {
        console.log("is this happenning?")
        this.getArticleList()
        console.log(response)
      })
    },
    upload() {
      // the file object is not empty
      console.log(this.image);

      // post image to server
      const formData = new FormData();
      formData.append('file', this.image);

      console.log(this.image)

    }
  }
}
</script>