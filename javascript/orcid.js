/**
 * Created by michaelcrabb on 05/03/2017.
 */


function createORCIDProfile(orcidID, elementID) {

  var ORCIDLink = "https://pub.orcid.org/v2.0/" + orcidID + "/works";

  fetch(ORCIDLink,

      {
        headers: {
          "Accept": "application/orcid+json"
        }
      })
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }

        // Examine the text in the response
        response.json().then(function(data) {
        
          //DEBUG!
          //console.log(data);
          
          
        // Sort the contents in the json file inside data.group by last-modified-date attribute
        data.group.sort(function(a, b) {
          return parseFloat(b["work-summary"]["0"]["created-date"]["value"]) - parseFloat(a["work-summary"]["0"]["created-date"]["value"]);
          });

        // Sort the contents in the json file inside data.group by publicationdate.year attribute
        data.group.sort(function(a, b) {
          return parseInt(b["work-summary"]["0"]["publication-date"]["year"]["value"],10) - parseInt(a["work-summary"]["0"]["publication-date"]["year"]["value"],10);
          });
  

          const text = JSON.stringify(data);

          let j_count = text.split("JOURNAL_ARTICLE").length;
          let c_count = text.split("CONFERENCE_PAPER").length;
          let b_count = text.split("BOOK_CHAPTER").length;
          let x_count = text.split("OTHER").length;
          let p_count = text.split("PATENT").length;

        
          var output_j = "";
          var output_c = "";
          var output_b = "";
          var output_x = "";
          var output_p = "";
          
          
          for (var i in data.group) {
            //PAPER NAME
            if (data.group[i]["work-summary"]["0"].title.title.value != null) {
              var publicationName = data.group[i]["work-summary"]["0"].title.title.value;
            }
        
        
            //PUBLICATION YEAR
            if (data.group[i]["work-summary"]["0"]["publication-date"] != null) {
              var publicationYear = data.group[i]["work-summary"]["0"]["publication-date"].year.value;
            } else {
              var publicationYear = "";
            }
        
            //DOI REFERENCE
            if (data.group[i]["external-ids"]["external-id"]["length"] != 0) {
              for (var j in data.group[i]["external-ids"]["external-id"]) {
                if (data.group[i]["external-ids"]["external-id"][j]["external-id-type"] == 'doi') {
                  var doiReference = data.group[i]["external-ids"]["external-id"][j]["external-id-value"];
                  break;
                }
              }
            } else {
              var doiReference = "";
            }

            //PAT REFERENCE
            if (data.group[i]["external-ids"]["external-id"]["length"] != 0) {
              for (var j in data.group[i]["external-ids"]["external-id"]) {
                if (data.group[i]["external-ids"]["external-id"][j]["external-id-type"] == 'pat') {
                  var patReference = data.group[i]["external-ids"]["external-id"][j]["external-id-value"];
                  break;
                }
              }
            } else {
              var patReference = "";
            }
            
            // console.log(data.group[i]["work-summary"]["0"]["type"]);
            
            //ARTICLE TYPE
            if (data.group[i]["work-summary"]["0"]["type"] == "JOURNAL_ARTICLE")
            {
            
                //JOURNAL NAME
                var putcode = data.group[i]["work-summary"]["0"]["put-code"];
                //console.log(journalTitle);
                j_count = j_count - 1;

                output_j += "<span id='publication_" + i + "'>" + "[J" + j_count + "] <b>"+ publicationName + "</b>";
                output_j += " (" + publicationYear + ") <br></em></span>";
                output_j += " <a href='https://doi.org/" + doiReference + "'> " + doiReference + "</a><br>";
                getJournalTitle(orcidID, putcode, i);
            
            
            }
            
            if (data.group[i]["work-summary"]["0"]["type"] == "CONFERENCE_PAPER")
            {
            
                //CONFERENCE_PAPER NAME
                var putcode = data.group[i]["work-summary"]["0"]["put-code"];
                //console.log(journalTitle);
                c_count = c_count - 1;

                output_c += "<span id='publication_" + i + "'>" + "[C" + c_count + "] <b>"+ publicationName + "</b>";
                output_c += " (" + publicationYear + ") <br></em></span>";
                output_c += " <a href='https://doi.org/" + doiReference + "'> " + doiReference + "</a><br>";
                getJournalTitle(orcidID, putcode, i);
            
            
            }

            
            if (data.group[i]["work-summary"]["0"]["type"] == "BOOK_CHAPTER")
            {
            
                //BOOK_CHAPTER NAME
                var putcode = data.group[i]["work-summary"]["0"]["put-code"];
                //console.log(journalTitle);
                b_count = b_count - 1;

                output_b += "<span id='publication_" + i + "'>" + "[B" + b_count + "] <b>"+ publicationName + "</b>";
                output_b += " (" + publicationYear + ") <br></em></span>";
                output_b += " <a href='https://doi.org/" + doiReference + "'> " + doiReference + "</a><br>";
                getJournalTitle(orcidID, putcode, i);
            
            
            }

            if (data.group[i]["work-summary"]["0"]["type"] == "OTHER")
            {
            
                //CONFERENCE_PAPER NAME
                var putcode = data.group[i]["work-summary"]["0"]["put-code"];
                //console.log(journalTitle);
                x_count = x_count - 1;

                output_x += "<span id='publication_" + i + "'>" + "[X" + x_count + "] <b>"+ publicationName + "</b>";
                output_x += " (" + publicationYear + ") <br></em></span>";
                output_x += " <a href='https://doi.org/" + doiReference + "'> " + doiReference + "</a><br>";
                getJournalTitle(orcidID, putcode, i);
                       
            }


            if (data.group[i]["work-summary"]["0"]["type"] == "PATENT")
            {
            
                //CONFERENCE_PAPER NAME
                var putcode = data.group[i]["work-summary"]["0"]["put-code"];
                //console.log(journalTitle);
                p_count = p_count - 1;

                output_p += "<span id='publication_" + i + "'>" + "[P" + p_count + "] <b>"+ publicationName + "</b>";
                output_p += "<br></em></span>";
                output_p += "  " + patReference + "<br>";
                getJournalTitle(orcidID, putcode, i);
                       
            }
        

        
          }
        
          document.getElementById(elementID).innerHTML = "<h2> Journals </h2>" + output_j + "<h2> Conferences </h2>"  + output_c + "<h2> Book Chapters </h2>"  + output_b + "<h2> Preprints </h2>"  + output_x + "<h2> Patents </h2>"  + output_p;
        });
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
}

function getJournalTitle(orcidID, journalID, i) {
  var ORCIDLink = "https://pub.orcid.org/v2.0/" + orcidID + "/work/" + journalID;
  fetch(ORCIDLink, {
      headers: {
        "Accept": "application/orcid+json"
      }
    })
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
        response.json().then(function(data) {
          if (data["journal-title"] != null) {
            var output = data["journal-title"].value;
            document.getElementById("publication_" + i).innerHTML = document.getElementById("publication_" + i).innerHTML + output;
          }
        });
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
}

function createORCIDFundingProfile(orcidID, elementID) {

  var ORCIDLink = "https://pub.orcid.org/v2.0/" + orcidID + "/fundings";

  fetch(ORCIDLink,

      {
        headers: {
          "Accept": "application/orcid+json"
        }
      })
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
        response.json().then(function(data) {

          ////DEBUG!
          // console.log(data);

          var output = "";
          for (var i in data.group) {
            //GET PUT CODES
            var putcode = data.group[i]["funding-summary"]["0"]["put-code"];
            getFundingInformation(putcode, orcidID, elementID)
          }

          document.getElementById(elementID).innerHTML = output;
        });
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
}

function getFundingInformation(putcode, orcidID, elementID) {
  var ORCIDLink = "https://pub.orcid.org/v2.0/" + orcidID + "/funding/" + putcode;

  fetch(ORCIDLink,

      {
        headers: {
          "Accept": "application/orcid+json"
        }
      })
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
        response.json().then(function(data) {

          ////DEBUG!
          console.log(data);

          if (data["title"] != null) {
            var fundingTitle = data["title"]["title"].value;
          } else {
            var fundingTitle = "";
          }

          if (data["organization-defined-type"].value != null) {
            var fundingType = data["organization-defined-type"].value;
          } else {
            var fundingType = "";
          }

          if (data["organization"]["name"] != null) {
            var fundingBody = data["organization"]["name"];
          } else {
            var fundingBody = "";
          }

          if (data["start-date"]["year"] != null) {
            var startDate = data["start-date"]["year"].value;
          } else {
            var startDate = "";
          }

          var output = "<p>";
          output += "<strong>" + fundingTitle + "</strong> ";
          output += "(" + startDate + "), "
          output += fundingBody + " <em>(" + fundingType + ")</em>";
          output += "</p>";

          document.getElementById(elementID).innerHTML = output + document.getElementById(elementID).innerHTML;

        });

      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
}
