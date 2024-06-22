



`$=const pages = dv.pages("#SessionSubcampaign/MalevolentWastes").where(p => p.SessionNumber && p.SessionNumber?.SubCampaignSessionNumber == dv.current().SessionNumber?.SubCampaignSessionNumber + 1); pages.length ? dv.span(pages.map(p => dv.fileLink(p.file.path, p.file.name +  " Session " + p.SessionNumber.SubCampaignSessionNumber))) : dv.span("No following session");`
